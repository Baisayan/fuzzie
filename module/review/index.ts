"use server";

import prisma from "@/lib/db";
import { getAuthenticatedUser } from "@/module/github";

export async function getReviews() {
  const { session } = await getAuthenticatedUser();

  const reviews = await prisma.review.findMany({
    where: {
      repository: {
        userId: session.user.id,
      },
    },
    include: {
      repository: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return reviews;
}
