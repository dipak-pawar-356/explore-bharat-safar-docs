// Explore Bharat Safar — Discovery Search Query DTO
// Reference: EBS-DOC-09-API Section 5.2, EBS-DOC-18-SEARCH
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DiscoverySearchLevel {
  ALL = 'all',
  STATE = 'state',
  DISTRICT = 'district',
  TALUKA = 'taluka',
  PLACE = 'place',
}

export class SearchDiscoveryDto {
  @IsString()
  @MinLength(2, { message: 'Search query must contain at least 2 characters.' })
  @MaxLength(100, { message: 'Search query cannot exceed 100 characters.' })
  q!: string;

  @IsOptional()
  @IsEnum(DiscoverySearchLevel)
  level?: DiscoverySearchLevel = DiscoverySearchLevel.ALL;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(500)
  radiusKm?: number;

  @IsOptional()
  @IsString()
  bbox?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
