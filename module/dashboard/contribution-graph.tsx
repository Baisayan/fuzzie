"use client";

import { ActivityCalendar } from "react-activity-calendar";

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionGraphProps {
  data?: {
    totalContributions: number;
    contributions: ContributionDay[];
  } | null;
}

const ContributionGraph = ({ data }: ContributionGraphProps) => {
  if (!data || !data.contributions.length) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8">
        <div className="text-muted-foreground">
          No contribution data available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-4 p-4">
      <div className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">
          {data.totalContributions}
        </span>{" "}
        contributions in last year
      </div>

      <div className="w-full overflow-x-auto">
        <div className="flex justify-center min-w-max px-4">
          <ActivityCalendar
            data={data.contributions}
            blockSize={12}
            blockMargin={4}
            fontSize={14}
            showWeekdayLabels
            showMonthLabels
            colorScheme="dark"
            theme={{
              dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;
