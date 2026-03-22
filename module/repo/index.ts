"use server";

import prisma from "@/lib/db";
import {
  getAuthenticatedUser,
  createWebhook,
  getRepositories,
} from "@/module/github";
import { inngest } from "@/inngest/client";

export const fetchRepositories = async (
  page: number = 1,
  perPage: number = 10,
) => {
  const { session } = await getAuthenticatedUser();

  const [githubRepos, dbRepos] = await Promise.all([
    getRepositories(page, perPage),
    prisma.repository.findMany({ where: { userId: session.user.id } }),
  ]);

  const connectedRepoIds = new Set(dbRepos.map((repo) => repo.githubId));

  return githubRepos.map((repo) => ({
    ...repo,
    isConnected: connectedRepoIds.has(BigInt(repo.id)),
  }));
};

export const connectRepository = async (
  owner: string,
  repo: string,
  githubId: number,
) => {
  const { session } = await getAuthenticatedUser();

  const webhook = await createWebhook(owner, repo);
  if (!webhook) throw new Error("Could not establish webhook");

  const newRepo = await prisma.repository.create({
    data: {
      githubId: BigInt(githubId),
      name: repo,
      owner,
      fullName: `${owner}/${repo}`,
      url: `https://github.com/${owner}/${repo}`,
      userId: session.user.id,
    },
  });

  try {
    await inngest.send({
      name: "repository.connected",
      data: { owner, repo, userId: session.user.id },
    });
  } catch (error) {
    console.error("Failed to trigger repository indexing:", error);
  }

  return { success: true, id: newRepo.id };
};
