// Explore Bharat Safar — Section 4: Traveller Social Platform REST API Controller
// Reference: EBS-DOC-15-SOCIAL, EBS-BLU-44-SOC, EBS-DOC-09-API Section 5.6

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { type User } from '@ebs/types';
import {
  UpdateProfileDto,
  CreatePostDto,
  UpdatePostDto,
  CreateCommunityDto,
  UpdateCommunityMemberRoleDto,
  UploadMediaPreSignedDto,
  SearchTravellerQueryDto,
} from './dto/social.dto';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // ==========================================
  // PROFILE ENDPOINTS
  // ==========================================

  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@CurrentUser() user: User) {
    const profile = await this.socialService.getMyProfile(user.id);
    return { data: profile };
  }

  @Public()
  @Get('profile/:username')
  async getProfile(@Param('username') username: string, @CurrentUser() user?: User) {
    const profile = await this.socialService.getProfile(username, user?.id);
    return { data: profile };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
    @Req() req: FastifyRequest,
  ) {
    const updated = await this.socialService.updateProfile(user.id, dto, req.ip);
    return { data: updated, message: 'Traveller profile updated successfully.' };
  }

  @Public()
  @Get('profile/:username/posts')
  async getUserPosts(
    @Param('username') username: string,
    @CurrentUser() user?: User,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Math.min(50, Math.max(1, parseInt(limit, 10))) : 20;
    const posts = await this.socialService.getUserPosts(username, user?.id, parsedLimit);
    return { data: posts };
  }

  @Public()
  @Get('search/travellers')
  async searchTravellers(@Query() query: SearchTravellerQueryDto) {
    const result = await this.socialService.searchTravellers(query);
    return {
      data: result.items,
      meta: { total: result.total, page: query.page || 1, limit: query.limit || 20 },
    };
  }

  // ==========================================
  // SOCIAL GRAPH ENDPOINTS
  // ==========================================

  @Post('graph/follow/:targetProfileId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async followUser(
    @CurrentUser() user: User,
    @Param('targetProfileId') targetProfileId: string,
    @Req() req: FastifyRequest,
  ) {
    const result = await this.socialService.followUser(user.id, targetProfileId, req.ip);
    const message =
      result.status === 'FOLLOWING'
        ? 'Now following traveller.'
        : 'Follow request submitted to private account.';
    return { data: result, message };
  }

  @Post('graph/unfollow/:targetProfileId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unfollowUser(
    @CurrentUser() user: User,
    @Param('targetProfileId') targetProfileId: string,
    @Req() req: FastifyRequest,
  ) {
    await this.socialService.unfollowUser(user.id, targetProfileId, req.ip);
    return { message: 'Successfully unfollowed user.' };
  }

  @Get('graph/follow-requests')
  @UseGuards(JwtAuthGuard)
  async getFollowRequests(@CurrentUser() user: User) {
    const requests = await this.socialService.getFollowRequests(user.id);
    return { data: requests };
  }

  @Post('graph/follow-requests/:requestId/accept')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async acceptFollowRequest(
    @CurrentUser() user: User,
    @Param('requestId') requestId: string,
    @Req() req: FastifyRequest,
  ) {
    await this.socialService.acceptFollowRequest(user.id, requestId, req.ip);
    return { message: 'Follow request accepted.' };
  }

  @Post('graph/follow-requests/:requestId/reject')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async rejectFollowRequest(
    @CurrentUser() user: User,
    @Param('requestId') requestId: string,
    @Req() req: FastifyRequest,
  ) {
    await this.socialService.rejectFollowRequest(user.id, requestId, req.ip);
    return { message: 'Follow request rejected.' };
  }

  @Public()
  @Get('graph/followers/:profileId')
  async getFollowers(@Param('profileId') profileId: string) {
    const followers = await this.socialService.getFollowers(profileId);
    return { data: followers };
  }

  @Public()
  @Get('graph/following/:profileId')
  async getFollowing(@Param('profileId') profileId: string) {
    const following = await this.socialService.getFollowing(profileId);
    return { data: following };
  }

  @Post('graph/block/:targetProfileId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async blockUser(
    @CurrentUser() user: User,
    @Param('targetProfileId') targetProfileId: string,
    @Req() req: FastifyRequest,
  ) {
    await this.socialService.blockUser(user.id, targetProfileId, req.ip);
    return { message: 'User blocked.' };
  }

  @Post('graph/unblock/:targetProfileId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unblockUser(
    @CurrentUser() user: User,
    @Param('targetProfileId') targetProfileId: string,
    @Req() req: FastifyRequest,
  ) {
    await this.socialService.unblockUser(user.id, targetProfileId, req.ip);
    return { message: 'User unblocked.' };
  }

  @Post('graph/mute/:targetProfileId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async muteUser(
    @CurrentUser() user: User,
    @Param('targetProfileId') targetProfileId: string,
    @Req() req: FastifyRequest,
  ) {
    await this.socialService.muteUser(user.id, targetProfileId, req.ip);
    return { message: 'User muted.' };
  }

  @Post('graph/unmute/:targetProfileId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unmuteUser(
    @CurrentUser() user: User,
    @Param('targetProfileId') targetProfileId: string,
    @Req() req: FastifyRequest,
  ) {
    await this.socialService.unmuteUser(user.id, targetProfileId, req.ip);
    return { message: 'User unmuted.' };
  }

  @Get('graph/relationship/:targetProfileId')
  @UseGuards(JwtAuthGuard)
  async getRelationship(
    @CurrentUser() user: User,
    @Param('targetProfileId') targetProfileId: string,
  ) {
    const relation = await this.socialService.getRelationship(user.id, targetProfileId);
    return { data: relation };
  }

  // ==========================================
  // POSTS & FEED ENDPOINTS
  // ==========================================

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @CurrentUser() user: User,
    @Body() dto: CreatePostDto,
    @Req() req: FastifyRequest,
  ) {
    const post = await this.socialService.createPost(user.id, dto, req.ip);
    return { data: post, message: 'Post published successfully.' };
  }

  @Public()
  @Get('posts/:id')
  async getPostById(@Param('id') id: string, @CurrentUser() user?: User) {
    const post = await this.socialService.getPostById(id, user?.id);
    return { data: post };
  }

  @Patch('posts/:id')
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @Req() req: FastifyRequest,
  ) {
    const updated = await this.socialService.updatePost(user.id, id, dto, req.ip);
    return { data: updated, message: 'Post updated successfully.' };
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deletePost(@CurrentUser() user: User, @Param('id') id: string, @Req() req: FastifyRequest) {
    await this.socialService.deletePost(user.id, id, req.ip);
    return { message: 'Post deleted successfully.' };
  }

  @Public()
  @Get('feed')
  async getFeed(
    @Query('feedType') feedType?: 'HOME' | 'FOLLOWING' | 'DISCOVER',
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: User,
  ) {
    const parsedLimit = limit ? Math.min(50, Math.max(1, parseInt(limit, 10))) : 20;
    const result = await this.socialService.getFeed(
      user?.id,
      feedType || 'HOME',
      cursor,
      parsedLimit,
    );
    return { data: result.items, meta: { nextCursor: result.nextCursor, limit: parsedLimit } };
  }

  @Public()
  @Get('feed/hashtag/:hashtag')
  async getHashtagFeed(
    @Param('hashtag') hashtag: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: User,
  ) {
    const parsedLimit = limit ? Math.min(50, Math.max(1, parseInt(limit, 10))) : 20;
    const result = await this.socialService.getHashtagFeed(hashtag, user?.id, cursor, parsedLimit);
    return { data: result.items, meta: { nextCursor: result.nextCursor, limit: parsedLimit } };
  }

  // ==========================================
  // MEDIA UPLOAD ENDPOINTS
  // ==========================================

  @Post('media/pre-signed-upload')
  @UseGuards(JwtAuthGuard)
  async requestPreSignedUpload(@CurrentUser() user: User, @Body() dto: UploadMediaPreSignedDto) {
    const uploadResult = await this.socialService.requestPreSignedMediaUpload(user.id, dto);
    return { data: uploadResult };
  }

  // ==========================================
  // COMMUNITY ENDPOINTS
  // ==========================================

  @Post('communities')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCommunity(
    @CurrentUser() user: User,
    @Body() dto: CreateCommunityDto,
    @Req() req: FastifyRequest,
  ) {
    const community = await this.socialService.createCommunity(user.id, dto, req.ip);
    return { data: community, message: 'Community created successfully.' };
  }

  @Public()
  @Get('communities')
  async getCommunities(@Query('q') query?: string) {
    const communities = await this.socialService.getCommunities(query);
    return { data: communities };
  }

  @Public()
  @Get('communities/:slug')
  async getCommunity(@Param('slug') slug: string, @CurrentUser() user?: User) {
    const community = await this.socialService.getCommunity(slug, user?.id);
    return { data: community };
  }

  @Post('communities/:slug/join')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async joinCommunity(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Req() req: FastifyRequest,
  ) {
    await this.socialService.joinCommunity(user.id, slug, req.ip);
    return { message: 'Successfully joined community.' };
  }

  @Post('communities/:slug/leave')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async leaveCommunity(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Req() req: FastifyRequest,
  ) {
    await this.socialService.leaveCommunity(user.id, slug, req.ip);
    return { message: 'Successfully left community.' };
  }

  @Patch('communities/:slug/members/:targetProfileId/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateCommunityMemberRole(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Param('targetProfileId') targetProfileId: string,
    @Body() dto: UpdateCommunityMemberRoleDto,
    @Req() req: FastifyRequest,
  ) {
    await this.socialService.updateCommunityMemberRole(
      user.id,
      slug,
      targetProfileId,
      dto.role,
      req.ip,
    );
    return { message: 'Community member role updated successfully.' };
  }

  @Public()
  @Get('communities/:slug/posts')
  async getCommunityPosts(
    @Param('slug') slug: string,
    @CurrentUser() user?: User,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Math.min(50, Math.max(1, parseInt(limit, 10))) : 20;
    const posts = await this.socialService.getCommunityPosts(slug, user?.id, parsedLimit);
    return { data: posts };
  }
}
