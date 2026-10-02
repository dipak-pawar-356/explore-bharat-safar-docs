// Explore Bharat Safar — Enterprise Search Request DTOs
// Reference: EBS-DOC-18-SEARCH, EBS-DOC-09-API
// Sprint 11: Enterprise Search Optimization

import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SearchContext } from '@ebs/types';

export class GlobalSearchDto {
  @IsString()
  q!: string;

  @IsOptional()
  @IsEnum(SearchContext)
  context?: SearchContext = SearchContext.GLOBAL;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  stateId?: string;

  @IsOptional()
  @IsString()
  districtId?: string;

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
  @Type(() => Number)
  @IsNumber()
  minElevation?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxElevation?: number;

  @IsOptional()
  @IsString()
  cursor?: string;

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

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  typoTolerance?: boolean = true;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  includeFacets?: boolean = false;
}

export class AutocompleteDto {
  @IsString()
  q!: string;

  @IsOptional()
  @IsEnum(SearchContext)
  context?: SearchContext = SearchContext.GLOBAL;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(20)
  limit?: number = 5;
}

export class SearchSuggestionsDto {
  @IsString()
  q!: string;

  @IsOptional()
  @IsEnum(SearchContext)
  context?: SearchContext = SearchContext.GLOBAL;
}

export class SearchAnalyticsDto {
  @IsString()
  query!: string;

  @IsEnum(SearchContext)
  context!: SearchContext;

  @IsNumber()
  @Min(0)
  hitsCount!: number;

  @IsNumber()
  @Min(0)
  executionTimeMs!: number;

  @IsOptional()
  @IsString()
  clickedId?: string;

  @IsOptional()
  @IsNumber()
  clickedPosition?: number;
}
