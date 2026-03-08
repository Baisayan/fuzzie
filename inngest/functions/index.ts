import prisma from "@/lib/db";
import { inngest } from "../client";
import { getRepoFileContents } from "@/module/github";
import { indexCodebase } from "@/module/ai/rag";

export const indexRepo = inngest.createFunction(
  { id: "index-repo" },
  { event: "repository.connected" },
  async ({ event, step }) => {
    const { owner, repo, userId } = event.data;

    const files = await step.run("fetch-files", async () => {
      const account = await prisma.account.findFirst({
        where: {
          userId: userId,
          providerId: "github",
        },
      });

      if (!account?.accessToken) {
        throw new Error("No GitHub access token found");
      }

      const files = await getRepoFileContents(account.accessToken, owner, repo);

      await indexCodebase(`${owner}/${repo}`, files);

      return files.length;
    });

    return { success: true, indexedFiles: files };
  },
);
