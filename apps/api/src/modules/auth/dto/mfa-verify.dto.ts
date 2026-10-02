import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class MfaVerifyDto {
  @IsString({ message: 'TOTP code must be a string' })
  @IsNotEmpty({ message: 'TOTP code is required' })
  @Length(6, 6, { message: 'TOTP code must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'TOTP code must be 6 numerical digits' })
  totpCode!: string;

  @IsOptional()
  @IsString()
  tempMfaToken?: string;
}
