// Explore Bharat Safar — Section 3: Travel Booking & Experiences API Gateway Controller
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG, EBS-DOC-09-API Section 5.4

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@ebs/types';
import {
  ReserveSlotDto,
  ConfirmBookingDto,
  CancelBookingDto,
  WaitlistJoinDto,
  CreateBatchDto,
  UpdateBatchDto,
  ExperienceFilterDto,
} from './dto/booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // =========================================================================
  // PUBLIC EXPERIENCE CATALOGUE ENDPOINTS
  // =========================================================================

  @Public()
  @Get('experiences')
  async getExperiences(@Query() query: ExperienceFilterDto) {
    const data = await this.bookingsService.getExperiences(query);
    return {
      status: 'success',
      data,
    };
  }

  @Public()
  @Get('experiences/:slug')
  async getExperienceBySlug(@Param('slug') slug: string) {
    const data = await this.bookingsService.getExperienceBySlug(slug);
    return {
      status: 'success',
      data,
    };
  }

  @Public()
  @Get('batches/:batchId/availability')
  async getBatchAvailability(@Param('batchId') batchId: string) {
    const data = await this.bookingsService.getBatchAvailability(batchId);
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // TRAVELLER CHECKOUT & RESERVATION ENDPOINTS
  // =========================================================================

  @Post('reserve')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async reserveSlots(@CurrentUser('id') userId: string, @Body() dto: ReserveSlotDto) {
    const data = await this.bookingsService.reserveSlots(userId, dto);
    return {
      status: 'success',
      data,
    };
  }

  @Post(':bookingId/confirm')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async confirmBooking(
    @Param('bookingId') bookingId: string,
    @CurrentUser('id') userId: string,
    @Body() dto?: ConfirmBookingDto,
  ) {
    const data = await this.bookingsService.confirmBooking(bookingId, userId, dto);
    return {
      status: 'success',
      data,
    };
  }

  @Post(':bookingId/cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async cancelBooking(
    @Param('bookingId') bookingId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CancelBookingDto,
  ) {
    const data = await this.bookingsService.cancelBooking(bookingId, userId, dto);
    return {
      status: 'success',
      data,
    };
  }

  @Post('batches/:batchId/waitlist')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async joinWaitlist(
    @Param('batchId') batchId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('fullName') userName: string | undefined,
    @CurrentUser('email') userEmail: string,
    @Body() dto: WaitlistJoinDto,
  ) {
    const data = await this.bookingsService.joinWaitlist(
      userId,
      { ...dto, batchId },
      userName,
      userEmail,
    );
    return {
      status: 'success',
      data,
    };
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  async getTravellerBookings(@CurrentUser('id') userId: string) {
    const data = await this.bookingsService.getTravellerBookings(userId);
    return {
      status: 'success',
      data,
    };
  }

  @Get(':bookingId')
  @UseGuards(JwtAuthGuard)
  async getBookingById(@Param('bookingId') bookingId: string, @CurrentUser('id') userId: string) {
    const data = await this.bookingsService.getBookingById(bookingId, userId);
    return {
      status: 'success',
      data,
    };
  }

  // =========================================================================
  // ADMIN & OPERATIONS CONSOLE ENDPOINTS
  // =========================================================================

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BOOKING_ADMIN)
  async getAllAdminBookings(
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('batchId') batchId?: string,
  ) {
    const data = await this.bookingsService.getAllAdminBookings({ status, q, batchId });
    return {
      status: 'success',
      data,
    };
  }

  @Post('admin/batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BOOKING_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createBatch(@Body() dto: CreateBatchDto) {
    const data = await this.bookingsService.createBatch(dto);
    return {
      status: 'success',
      data,
    };
  }

  @Patch('admin/batches/:batchId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BOOKING_ADMIN)
  async updateBatch(@Param('batchId') batchId: string, @Body() dto: UpdateBatchDto) {
    const data = await this.bookingsService.updateBatch(batchId, dto);
    return {
      status: 'success',
      data,
    };
  }

  @Get('admin/batches/:batchId/manifest')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SYSTEM_ADMIN, UserRole.BOOKING_ADMIN)
  async getBatchManifest(@Param('batchId') batchId: string) {
    const data = await this.bookingsService.getBatchManifest(batchId);
    return {
      status: 'success',
      data,
    };
  }
}
