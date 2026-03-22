"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getReviews } from "@/module/review";

type Review = Awaited<ReturnType<typeof getReviews>>[number];

export default function ReviewsPage({
  initialData,
}: {
  initialData: Review[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review History</h1>
        <p className="text-muted-foreground">View all AI code reviews</p>
      </div>

      {initialData.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No reviews yet. Connect a repository and open a PR to get
                started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {initialData.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {review.prTitle}
                      </CardTitle>
                      <Badge
                        variant={
                          review.status === "completed"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {review.status === "completed" ? (
                          <CheckCircle2 className="size-3" />
                        ) : (
                          <XCircle className="size-3" />
                        )}
                        {review.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {review.repository.fullName} ⋅ PR #{review.prNumber}
                    </CardDescription>
                  </div>

                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={review.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(review.createdAt), {
                    addSuffix: true,
                  })}
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="whitespace-pre-wrap text-xs">
                    {review.review.substring(0, 300)}
                    ....
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <a
                    href={review.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Full Review on GitHub
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
