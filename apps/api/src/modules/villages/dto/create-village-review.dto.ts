// Explore Bharat Safar — Create Village Review DTO
// Reference: EBS-BLU-42-VKS Section 10

import type { VillageRatingBreakdown } from '@ebs/types';

export class CreateVillageReviewDto {
  ratings!: VillageRatingBreakdown;
  reviewText!: string;
  photoUrls?: string[];
}
