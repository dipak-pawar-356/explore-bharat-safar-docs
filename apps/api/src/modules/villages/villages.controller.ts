// Explore Bharat Safar — Section 2: Villages & Rural Knowledge Controller
// Reference: EBS-BLU-42-VKS, EBS-DOC-09-API Section 5.3, EBS-DOC-40-SEC Section 4

import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { VillagesService } from './villages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { VillageScopeGuard } from '../../common/guards/village-scope.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { VillageScoped } from '../../common/decorators/village-scoped.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@ebs/types';
import {
  SearchVillageDto,
  SubmitVillageUpdateDto,
  ModerateVillageUpdateDto,
  CreateVillageReviewDto,
} from './dto';

@Controller('villages')
export class VillagesController {
  constructor(private readonly villagesService: VillagesService) {}

  /**
   * Section 2 Dedicated Search Endpoint:
   * HARD QUARANTINE: Returns exclusively Village entities, Gram Panchayat names, and LGD codes.
   */
  @Get('search')
  async searchVillages(
    @Query('q') q?: string,
    @Query('name') name?: string,
    @Query('pincode') pincode?: string,
    @Query('talukaId') talukaId?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const dto: SearchVillageDto = {
      q,
      name,
      pincode,
      talukaId,
      limit: limit ? Number(limit) : 20,
      page: page ? Number(page) : 1,
    };
    return this.villagesService.searchVillages(dto);
  }

  /**
   * District / Taluka Moderator Review Feed of Pending Updates
   */
  @Get('moderation/queue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.SUPER_ADMIN)
  async getModerationQueue(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.villagesService.getModerationQueue(
      status || 'PENDING_APPROVAL',
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  /**
   * Approves or Rejects a staged update with mandatory commentary
   */
  @Post('moderation/:stagingId/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.SUPER_ADMIN)
  async reviewStagingUpdate(
    @Param('stagingId') stagingId: string,
    @CurrentUser('id') moderatorId: string,
    @Body() body: ModerateVillageUpdateDto,
  ) {
    return this.villagesService.reviewStagedUpdate(
      stagingId,
      moderatorId,
      body.action,
      body.comments,
    );
  }

  @Patch('moderation/:stagingId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.SUPER_ADMIN)
  async patchStagingUpdate(
    @Param('stagingId') stagingId: string,
    @CurrentUser('id') moderatorId: string,
    @Body() body: ModerateVillageUpdateDto,
  ) {
    return this.villagesService.reviewStagedUpdate(
      stagingId,
      moderatorId,
      body.action,
      body.comments,
    );
  }

  /**
   * Retrieves comprehensive Village Living Dossier by UUID or LGD Code
   */
  @Get(':id')
  async getVillageById(@Param('id') id: string) {
    return this.villagesService.getVillageById(id);
  }

  /**
   * Retrieves verified historical places, sacred groves, and monuments in the village
   */
  @Get(':id/places')
  async getVillagePlaces(@Param('id') id: string) {
    return this.villagesService.getVillagePlaces(id);
  }

  /**
   * Retrieves upcoming and recurring community festivals, Jatras, and Gram Sabhas
   */
  @Get(':id/events')
  async getVillageEvents(@Param('id') id: string) {
    return this.villagesService.getVillageEvents(id);
  }

  /**
   * Retrieves verified rural businesses (homestays, guides, craft workshops)
   */
  @Get(':id/businesses')
  async getVillageBusinesses(@Param('id') id: string) {
    return this.villagesService.getVillageBusinesses(id);
  }

  /**
   * Retrieves verified artisan and craftsperson directory (master artisans, GI tags, workshops)
   */
  @Get(':id/artisans')
  async getVillageArtisans(@Param('id') id: string) {
    return this.villagesService.getVillageArtisans(id);
  }

  /**
   * Retrieves verified rural homestays and community lodges directory
   * Directory View Only — NO bookings or payments
   */
  @Get(':id/homestays')
  async getVillageHomestays(@Param('id') id: string) {
    return this.villagesService.getVillageHomestays(id);
  }

  /**
   * Retrieves 10-point multidimensional reviews for the village
   */
  @Get(':id/reviews')
  async getVillageReviews(@Param('id') id: string) {
    return this.villagesService.getVillageReviews(id);
  }

  /**
   * Submits a 10-point multidimensional review for the village
   */
  @Post(':id/reviews')
  @UseGuards(JwtAuthGuard)
  async submitVillageReview(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: CreateVillageReviewDto,
  ) {
    return this.villagesService.submitVillageReview(id, userId, body);
  }

  /**
   * Submits a village profile or facility update to staging.
   * Multi-Tenant Isolation:
   * - Enforced by VillageScopeGuard: user.assignedVillageId must match :id for VILLAGE_ADMIN.
   * - Cross-village attempts return 403 Forbidden.
   * - SUPER_ADMIN and MODERATOR are exempted.
   */
  @Post(':id/updates')
  @UseGuards(JwtAuthGuard, RolesGuard, VillageScopeGuard)
  @Roles(UserRole.VILLAGE_ADMIN, UserRole.MODERATOR, UserRole.SUPER_ADMIN)
  @VillageScoped('id')
  async submitUpdate(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: SubmitVillageUpdateDto,
  ) {
    return this.villagesService.submitUpdate(
      id,
      userId,
      body.updateType,
      body.payload,
      body.editorialNotes,
    );
  }
}
