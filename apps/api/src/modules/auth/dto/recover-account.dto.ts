import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RecoverAccountDto {
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Recovery code is required' })
  recoveryCode!: string;

  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  @Length(12, 128, { message: 'Password must be between 12 and 128 characters' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one numerical digit' })
  @Matches(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' })
  newPassword!: string;
}
