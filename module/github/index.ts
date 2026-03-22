import { Octokit } from "octokit";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { cache } from "react";

export const getAuthenticatedUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "github" },
  });

  if (!account?.accessToken) throw new Error("No GitHub token");

  const octokit = new Octokit({ auth: account.accessToken });
  const { data: user } = await octokit.rest.users.getAuthenticated();

  return { session, token: account.accessToken, username: user.login, octokit };
});

export async function fetchUserContribution(token: string, username: string) {
  const octokit = new Octokit({ auth: token });

  const query = `
        query($username: String!) {
            user(login: $username) {
                contributionsCollection {
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                contributionCount
                                date
                                color
                            }
                        }
                    }
                }
            }
        }
    `;

  try {
    const response: any = await octokit.graphql(query, {
      username,
    });

    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error("Error fetching contribution data:", error);
    return null;
  }
}

export const getRepositories = async (
  page: number = 1,
  perPage: number = 10,
) => {
  const { octokit } = await getAuthenticatedUser();

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    visibility: "all",
    per_page: perPage,
    page: page,
  });

  return data;
};

export const createWebhook = async (owner: string, repo: string) => {
  const { octokit } = await getAuthenticatedUser();
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

  try {
    const { data: hooks } = await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    });

    const existingWebhook = hooks.find(
      (hook) => hook.config.url === webhookUrl,
    );
    if (existingWebhook) return existingWebhook;

    const { data } = await octokit.rest.repos.createWebhook({
      owner,
      repo,
      config: {
        url: webhookUrl,
        content_type: "json",
      },
      events: ["pull_request"],
    });

    return data;
  } catch (error) {
    console.error("Error creating webhook:", error);
    throw new Error("Webhook creation failed");
  }
};

export const deleteWebhook = async (owner: string, repo: string) => {
  const { octokit } = await getAuthenticatedUser();
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

  try {
    const { data: hooks } = await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    });

    const hookToDelete = hooks.find((hook) => hook.config.url === webhookUrl);

    if (!hookToDelete) {
      console.warn(`No webhook found matching ${webhookUrl}`);
      return { success: false, reason: "NOT_FOUND" };
    }

    await octokit.rest.repos.deleteWebhook({
      owner,
      repo,
      hook_id: hookToDelete.id,
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting webhook:", error);
    throw new Error("Failed to delete webhook");
  }
};

export async function getRepoFileContents(
  token: string,
  owner: string,
  repo: string,
  branch: string = "main",
): Promise<{ path: string; content: string }[]> {
  const octokit = new Octokit({ auth: token });

  try {
    const { data: treeData } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: "true",
    });

    const files = treeData.tree.filter(
      (item) =>
        item.type === "blob" &&
        !item.path?.match(
          /\.(png|jpg|jpeg|gif|svg|ico|pdf|zip|tar|gz|lock|map|exe|dll|pyc)$/i,
        ),
    );

    if (!files || files.length === 0) throw new Error("No files found in repo");
    if (files.length > 300) throw new Error("Repo too large for indexing");

    const results: { path: string; content: string }[] = [];
    const CHUNK_SIZE = 20;

    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
      const chunk = files.slice(i, i + CHUNK_SIZE);

      const chunkResults = await Promise.all(
        chunk.map(async (file) => {
          const { data: blob } = await octokit.rest.git.getBlob({
            owner,
            repo,
            file_sha: file.sha!,
          });

          return {
            path: file.path!,
            content: Buffer.from(blob.content, "base64").toString("utf-8"),
          };
        }),
      );

      results.push(...chunkResults);
    }

    return results;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error(
      "An unexpected error occurred while fetching repo contents",
    );
  }
}

export async function getPullRequestDiff(
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
) {
  const octokit = new Octokit({ auth: token });

  const [prResponse, diffResponse] = await Promise.all([
    octokit.rest.pulls.get({ owner, repo, pull_number: prNumber }),
    octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
      mediaType: { format: "diff" },
    }),
  ]);

  return {
    diff: diffResponse.data as unknown as string,
    title: prResponse.data.title,
    description: prResponse.data.body,
  };
}

export async function postReviewComment(
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
  review: string,
) {
  const octokit = new Octokit({ auth: token });

  await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number: prNumber,
    body: `## CodeNakama Review\n\n${review}`,
    event: "COMMENT",
  });
}
