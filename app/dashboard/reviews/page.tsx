import { getReviews } from "@/module/review";
import ReviewsClient from "@/module/review/reviews-client";

export default async function ReviewsPage() {
  const data = await getReviews();
  return <ReviewsClient initialData={data} />;
}
