// Explore Bharat Safar — Submit Village Update DTO
// Reference: EBS-BLU-42-VKS Section 4, EBS-DOC-09-API Section 5.3

export class SubmitVillageUpdateDto {
  updateType!: string;
  payload!: Record<string, unknown>;
  editorialNotes?: string;
}
