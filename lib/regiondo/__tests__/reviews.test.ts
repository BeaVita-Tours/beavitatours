import { describe, expect, it } from "vitest";

import reviews from "./fixtures/reviews.json";

import { toTourReview } from "@/lib/regiondo/map";
import { toReview, toReviews } from "@/lib/regiondo/reviews";
import { reviewListSchema } from "@/lib/regiondo/schemas";

const tourReviews = reviewListSchema.parse(reviews.data).map(toTourReview);

describe("toReview", () => {
  it("bridges a real Regiondo review to the homepage card shape", () => {
    const review = toReview(tourReviews[0]!);
    expect(review).not.toBeNull();
    expect(review?.source).toBe("regiondo");
    expect(review?.id).toBe(`regiondo:${tourReviews[0]!.id}`);
    expect(review?.authorName).toBe(tourReviews[0]!.author);
    expect(review?.rating).toBe(tourReviews[0]!.rating);
    expect(review?.title).toBe(tourReviews[0]!.title);
    expect(review?.text).toBe(tourReviews[0]!.body);
  });

  it("pins the space-separated Regiondo timestamp to a UTC ISO instant", () => {
    const review = toReview({ ...tourReviews[0]!, createdAt: "2026-08-29 08:04:10" });
    expect(review?.date).toBe("2026-08-29T08:04:10.000Z");
  });

  it("leaves the date empty when Regiondo sends none", () => {
    const review = toReview({ ...tourReviews[0]!, createdAt: null });
    expect(review?.date).toBe("");
  });

  it("drops a review with no score rather than render zero stars", () => {
    expect(toReview({ ...tourReviews[0]!, rating: null })).toBeNull();
  });

  it("carries the operator reply through and omits absent optionals", () => {
    const withReply = toReview({ ...tourReviews[0]!, response: "Thank you!" });
    expect(withReply?.ownerResponse).toBe("Thank you!");

    const bare = toReview({ ...tourReviews[0]!, title: "", response: null });
    expect(bare).not.toHaveProperty("title");
    expect(bare).not.toHaveProperty("ownerResponse");
  });

  it("maps a whole list, skipping the unscored", () => {
    const list = toReviews([...tourReviews, { ...tourReviews[0]!, id: "x", rating: null }]);
    expect(list).toHaveLength(tourReviews.length);
  });
});
