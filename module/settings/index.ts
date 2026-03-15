"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { deleteWebhook, getAuthenticatedUser } from "../github";

export async function getSettingsPageData() {
  try {
    const { session } = await getAuthenticatedUser();

    const [user, repositories] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      }),
      prisma.repository.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          name: true,
          fullName: true,
          url: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { user, repositories };
  } catch (error) {
    console.error("Settings data fetch failed:", error);
    return { user: null, repositories: [] };
  }
}

export async function updateUserProfile(data: {
  name?: string;
  email?: string;
}) {
  try {
    const { session } = await getAuthenticatedUser();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: data.name, email: data.email },
      select: { id: true, name: true, email: true },
    });

    revalidatePath("/dashboard/settings");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: "Update failed" };
  }
}

export async function disconnectRepository(repositoryId: string) {
  try {
    const { session } = await getAuthenticatedUser();

    const repo = await prisma.repository.findUnique({
      where: { id: repositoryId, userId: session.user.id },
    });

    if (!repo) throw new Error("Repository not found");

    await Promise.allSettled([
      deleteWebhook(repo.owner, repo.name),
      prisma.repository.delete({
        where: { id: repositoryId, userId: session.user.id }, //
      }),
    ]);

    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error disconnecting repository:", error);
    return { success: false, error: "Disconnect repository failed." };
  }
}

export async function disconnectAllRepositories() {
  try {
    const { session } = await getAuthenticatedUser();

    const repositories = await prisma.repository.findMany({
      where: { userId: session.user.id },
    });

    await Promise.allSettled(
      repositories.map((repo) => {
        deleteWebhook(repo.owner, repo.name);
      }),
    );

    const result = await prisma.repository.deleteMany({
      where: { userId: session.user.id },
    });

    revalidatePath("/dashboard", "layout");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error disconnecting all repos:", error);
    return { success: false, error: "Failed to disconnect all." };
  }
}
