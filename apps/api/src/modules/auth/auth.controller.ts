import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RecoverAccountDto } from './dto/recover-account.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MfaVerifyDto } from './dto/mfa-verify.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User, SessionInfo } from '@ebs/types';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/v1/auth',
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
};

@ApiTags('Authentication & Identity')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new explorer account' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Email or phone already in use' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const ip = req.ip || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    const result = await this.authService.register(dto, ip, userAgent);

    if (res.setCookie && result.refreshToken) {
      res.setCookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    }

    return result.authResponse;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user credentials and issue session tokens' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or account locked' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const ip = req.ip || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    const result = await this.authService.login(dto, ip, userAgent);

    if (res.setCookie && result.refreshToken) {
      res.setCookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    }

    return result.authResponse;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token and mint fresh 15-minute access JWT' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
    @Body('refreshToken') bodyRefreshToken?: string,
  ) {
    const cookieToken = req.cookies ? req.cookies[REFRESH_COOKIE_NAME] : undefined;
    const refreshToken = cookieToken || bodyRefreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException({
        errorCode: 'EBS_AUTH_NO_REFRESH_TOKEN',
        message: 'No refresh token provided in cookies or request body.',
      });
    }

    const ip = req.ip || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    const result = await this.authService.refresh(refreshToken, ip, userAgent);

    if (res.setCookie && result.refreshToken) {
      res.setCookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    }

    return result.authResponse;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke active refresh token session' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
    @Body('refreshToken') bodyRefreshToken?: string,
  ) {
    const cookieToken = req.cookies ? req.cookies[REFRESH_COOKIE_NAME] : undefined;
    const refreshToken = cookieToken || bodyRefreshToken;
    const ip = req.ip || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';
    const userObj = (req as unknown as { user?: { id?: string } }).user;
    const userId = userObj?.id;

    if (refreshToken) {
      await this.authService.logout(refreshToken, userId, ip, userAgent);
    } else if (userId) {
      await this.authService.logout(undefined, userId, ip, userAgent);
    }

    if (res.clearCookie) {
      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
    }

    return {
      success: true,
      message: 'Session terminated and credentials cleared successfully.',
    };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address with cryptographic token' })
  @ApiResponse({ status: 200, description: 'Email successfully verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Body() dto: VerifyEmailDto, @Req() req: FastifyRequest) {
    const ip = req.ip || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    await this.authService.verifyEmail(dto.token, ip, userAgent);

    return {
      success: true,
      message: 'Email address has been successfully verified.',
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset instructions' })
  @ApiResponse({ status: 200, description: 'Reset instructions dispatched if account exists' })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: FastifyRequest) {
    const ip = req.ip || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    const result = await this.authService.requestPasswordReset(dto.email, ip, userAgent);
    return result;
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete password reset and invalidate active sessions' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const ip = req.ip || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    const result = await this.authService.resetPassword(dto, ip, userAgent);

    if (res.clearCookie) {
      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
    }

    return result;
  }

  @Public()
  @Post('recover-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Emergency account recovery using backup recovery code' })
  @ApiResponse({ status: 200, description: 'Account recovered successfully' })
  @ApiResponse({ status: 401, description: 'Invalid recovery credentials' })
  async recoverAccount(
    @Body() dto: RecoverAccountDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const ip = req.ip || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    const result = await this.authService.recoverAccount(dto, ip, userAgent);

    if (res.clearCookie) {
      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
    }

    return result;
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update password for authenticated user' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 401, description: 'Current password incorrect' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
    @Req() req: FastifyRequest,
  ) {
    const ip = req.ip || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    return this.authService.changePassword(userId, dto, ip, userAgent);
  }

  @Public()
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 6-digit TOTP code and finalize session' })
  @ApiResponse({ status: 200, description: 'MFA verified, session issued' })
  @ApiResponse({ status: 401, description: 'Invalid or expired MFA token' })
  async verifyMfa(
    @Body() dto: MfaVerifyDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const authHeader = req.headers.authorization;
    const ip = req.ip || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    const result = await this.authService.verifyMfa(dto, authHeader, ip, userAgent);

    if (res.setCookie && result.refreshToken) {
      res.setCookie(REFRESH_COOKIE_NAME, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    }

    return result.authResponse;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve currently authenticated user profile and roles' })
  @ApiResponse({ status: 200, description: 'Authenticated user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized or expired token' })
  async getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Universal logout: Invalidate all active sessions across all devices' })
  @ApiResponse({ status: 200, description: 'All active sessions terminated successfully' })
  async logoutAll(
    @CurrentUser('id') userId: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const ip = req.ip || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    await this.authService.logout(undefined, userId, ip, userAgent);

    if (res.clearCookie) {
      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
    }

    return {
      success: true,
      message: 'All active sessions across all devices have been terminated.',
    };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all active multi-device sessions for current user' })
  @ApiResponse({ status: 200, description: 'List of active sessions' })
  async listSessions(
    @CurrentUser('id') userId: string,
    @Req() req: FastifyRequest,
  ): Promise<SessionInfo[]> {
    const cookieToken = req.cookies ? req.cookies[REFRESH_COOKIE_NAME] : undefined;
    return this.authService.listSessions(userId, cookieToken);
  }

  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific active multi-device session' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async revokeSession(@CurrentUser('id') userId: string, @Param('sessionId') sessionId: string) {
    await this.authService.revokeSession(userId, sessionId);
    return {
      success: true,
      message: 'Specified device session has been revoked.',
    };
  }
}
