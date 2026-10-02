// Explore Bharat Safar — Place Query Filter DTO
// Reference: EBS-DOC-09-API, EBS-BLU-41-BDE
import { IsOptional, IsString, IsNumber, Min, Max, IsBoolean, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PlaceQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsUUID()
  stateId?: string;

  @IsOptional()
  @IsUUID()
  districtId?: string;

  @IsOptional()
  @IsUUID()
  talukaId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  has3DLandmark?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  bookingEnabledOnly?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
