// Explore Bharat Safar — Search Village DTO
// Reference: EBS-BLU-42-VKS Section 12.1, EBS-DOC-09-API Section 5.3

export class SearchVillageDto {
  q?: string;
  name?: string;
  pincode?: string;
  talukaId?: string;
  limit?: number;
  page?: number;
}
