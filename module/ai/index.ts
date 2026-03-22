"use server";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";

export async function reviewPullRequest(
  owner: string,
  repo: string,
  prNumber: number,
) {
  let repositoryId: string | null = null;

  try {
    const repository = await prisma.repository.findFirst({
      where: { owner, name: repo },
      include: {
        user: {
          include: {
            accounts: {
              where: { providerId: "github" },
            },
          },
        },
      },
    });

    if (!repository)
      throw new Error(`Repo ${owner}/${repo} not found in database.`);

    repositoryId = repository.id;
    const githubAccount = repository.user.accounts[0];

    if (!githubAccount?.accessToken) {
      throw new Error(`No GitHub access token found for repository owner.`);
    }

    await inngest.send({
      name: "pr.review.requested",
      data: {
        owner,
        repo,
        prNumber,
        userId: repository.user.id,
      },
    });

    return { success: true, message: "Review Queued" };
  } catch (error) {
    console.error(
      `Review request failed:`,
      error instanceof Error ? error.message : "Unknown Error",
    );

    if (repositoryId) {
      await prisma.review
        .create({
          data: {
            repositoryId,
            prNumber,
            prTitle: "Failed to fetch PR",
            prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
            review: `Error: ${
              error instanceof Error ? error.message : "Unknown Error"
            }`,
            status: "failed",
          },
        })
        .catch((e) => console.error("Could not save failure record:", e));
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown Error",
    };
  }
}
