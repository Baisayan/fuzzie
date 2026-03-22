"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { connectRepository } from "@/module/repo";

export const useConnectRepository = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      owner,
      repo,
      githubId,
    }: {
      owner: string;
      repo: string;
      githubId: number;
    }) => connectRepository(owner, repo, githubId),
    onSuccess: () => {
      toast.success("Repository connected successfully!");
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    },
    onError: (error) => {
      console.error("Connection error:", error);
      toast.error("Failed to connect repository");
    },
  });
};
