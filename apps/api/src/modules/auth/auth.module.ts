import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuditLogService } from '../../common/services/audit-log.service';
import { CaptchaService } from '../../common/services/captcha.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret:
        process.env.JWT_SECRET || 'ebs_super_secure_jwt_dev_secret_key_minimum_32_characters_long',
      signOptions: { expiresIn: '15m' },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'auth-limit',
        ttl: 300000, // 5 minutes in milliseconds
        limit: 5, // 5 attempts per 5 minutes
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuditLogService, CaptchaService],
  exports: [AuthService, PassportModule, JwtModule, AuditLogService, CaptchaService],
})
export class AuthModule {}
