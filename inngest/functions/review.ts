import { inngest } from "../client";
import { getPullRequestDiff, postReviewComment } from "@/module/github";
import { retrieveContext } from "@/module/ai/rag";
import prisma from "@/lib/db";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const generateReview = inngest.createFunction(
  { id: "generate-review", concurrency: 5 },
  { event: "pr.review.requested" },
  async ({ event, step }) => {
    const { owner, repo, prNumber, userId } = event.data;

    // get metadata like token and repoId
    const metadata = await step.run("fetch-metadata", async () => {
      const [repository, account] = await Promise.all([
        prisma.repository.findFirst({
          where: { owner, name: repo, userId },
        }),
        prisma.account.findFirst({
          where: { userId: userId, providerId: "github" },
        }),
      ]);

      if (!repository) throw new Error("Repository not found");
      if (!account?.accessToken) throw new Error("GitHub token not found");

      return {
        repoId: repository.id,
        token: account.accessToken,
      };
    });

    // 2. fetch PR Data
    const prData = await step.run("fetch-pr-data", async () => {
      return await getPullRequestDiff(metadata.token, owner, repo, prNumber);
    });

    // get codebase context relevant to pr diff
    const context = await step.run("retrieve-context", async () => {
      const query = `${prData.title}\n${prData.description}\n${prData.diff}`;
      return await retrieveContext(query, `${owner}/${repo}`);
    });

    // generates the ai review based on pr diff n context from codebase
    const review = await step.run("generate-ai-review", async () => {
      const prompt = `You are an expert code reviewer. Analyze the following pull request:

PR Title: ${prData.title}
PR Description: ${prData.description || "No description provided"}

Relevant Code Context
${context.join("\n\n")}

Code Changes:
\`\`\`diff
${prData.diff}
\`\`\`

Analyze the code specifically for:
- Logic and Correctness
- Security Vulnerabilities or issues
- Performance Bottlenecks 
- Maintainability and Code Quality

# Output Format (Strict Markdown)
## Walkthrough
[Explain the changes file-by-file in 1-2 sentences each]

## Summary
[Provide a high-level overview of the impact of these changes]

## Strengths
[List 2-3 specific things the developer did well in this PR]

## Issues & Improvements
[List critical bugs, security risks, or code smells. Use code blocks for suggested fixes.]

## Suggestions
[Non-critical ideas for better readability or future-proofing.]

Keep the response concise, practical, and grounded in the provided code.`;

      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt,
      });

      return text;
    });

    // post review as a comment on PR and save to db
    await step.run("finalize-review", async () => {
      await Promise.all([
        postReviewComment(metadata.token, owner, repo, prNumber, review),
        prisma.review.create({
          data: {
            repositoryId: metadata.repoId,
            prNumber,
            prTitle: prData.title,
            prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
            review: review,
            status: "completed",
          },
        }),
      ]);
    });

    return { success: true };
  },
);
