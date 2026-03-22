import { fetchUserContribution, getAuthenticatedUser } from "@/module/github";
import prisma from "@/lib/db";

interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

interface GitHubPR {
  created_at: string;
}

interface DbReview {
  createdAt: Date;
}

interface MonthlyStats {
  commits: number;
  prs: number;
  reviews: number;
}

export async function getDashboardStats() {
  try {
    const { session, token, username, octokit } = await getAuthenticatedUser();

    const [totalRepos, calendar, prs, totalReviews, dbReviews] =
      await Promise.all([
        prisma.repository.count({ where: { userId: session.user.id } }),
        fetchUserContribution(token, username),
        octokit.rest.search.issuesAndPullRequests({
          q: `author:${username} type:pr`,
          per_page: 100,
        }),
        prisma.review.count({
          where: { repository: { userId: session.user.id } },
        }),
        prisma.review.findMany({
          where: {
            repository: { userId: session.user.id },
            createdAt: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
            },
          },
          select: { createdAt: true },
        }),
      ]);

    const stats = {
      totalCommits: calendar?.totalContributions || 0,
      totalPrs: prs.data.total_count || 0,
      totalReviews,
      totalRepos,
    };

    const monthlyActivity = processMonthlyData(
      calendar,
      prs.data.items,
      dbReviews,
    );
    const contributions = processContributionData(calendar);

    return { stats, monthlyActivity, contributions };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return null;
  }
}

function processMonthlyData(
  calendar: ContributionCalendar | null | undefined,
  prs: GitHubPR[],
  reviews: DbReview[],
) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyData: Record<string, MonthlyStats> = {};
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyData[monthNames[d.getMonth()]] = { commits: 0, prs: 0, reviews: 0 };
  }

  calendar?.weeks.forEach((week) =>
    week.contributionDays.forEach((day: any) => {
      const monthKey = monthNames[new Date(day.date).getMonth()];
      if (monthlyData[monthKey]) monthlyData[monthKey].commits += day.contributionCount;
    }),
  );

  prs.forEach((pr: any) => {
    const m = monthNames[new Date(pr.created_at).getMonth()];
    if (monthlyData[m]) monthlyData[m].prs += 1;
  });

  reviews.forEach((r: any) => {
    const m = monthNames[r.createdAt.getMonth()];
    if (monthlyData[m]) monthlyData[m].reviews += 1;
  });

  return Object.keys(monthlyData).map((name) => ({
    name,
    ...monthlyData[name],
  }));
}

function processContributionData(calendar: ContributionCalendar | null | undefined) {
  if (!calendar) return null;
  return {
    totalContributions: calendar.totalContributions,
    contributions: calendar.weeks.flatMap((w: any) =>
      w.contributionDays.map((d: any) => ({
        date: d.date,
        count: d.contributionCount,
        level: Math.min(4, Math.floor(d.contributionCount / 3)),
      })),
    ),
  };
}
