// Explore Bharat Safar — Admin DTOs
// Reference: EBS-DOC-13-ADMIN, EBS-DOC-09-API

import {
  IsEnum,
  IsOptional,
  IsBoolean,
  IsString,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { UserRole, AccountStatus } from '@ebs/types';

export class UpdateUserRolesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(UserRole, { each: true })
  roles: UserRole[] = [];

  @IsOptional()
  @IsUUID()
  assignedVillageId?: string;
}

export class UpdateUserStatusDto {
  @IsEnum(AccountStatus)
  status: AccountStatus = AccountStatus.ACTIVE;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UserManagementFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class ToggleFeatureFlagDto {
  @IsBoolean()
  isEnabled: boolean = false;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateNavigationTreeDto {
  // Accept any valid JSON tree structure — validated at service layer with Zod
  sections: unknown[] = [];
}

export class UpdateGlobalPaymentPercentageDto {
  @IsInt()
  @Min(10)
  @Max(100)
  percentage: number = 25;

  @IsString()
  reason: string = '';
}

export class AdminModerationActionDto {
  @IsString()
  action: string = '';

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AuditLogQueryDto {
  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsUUID()
  resourceId?: string;

  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}

export class GenerateReportDto {
  @IsString()
  reportType: string = '';

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;
}
