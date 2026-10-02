// Explore Bharat Safar — Moderate Village Update DTO
// Reference: EBS-BLU-42-VKS Section 4, EBS-DOC-09-API Section 5.3

export class ModerateVillageUpdateDto {
  action!: 'APPROVE' | 'REJECT';
  comments!: string;
}
