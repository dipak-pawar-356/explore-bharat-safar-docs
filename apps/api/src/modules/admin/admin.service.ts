import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@ebs/database';

@Injectable()
export class AdminService {
  /**
   * Retrieves platform telemetry and high-level health overview
   */
  async getMetricsOverview() {
    const [totalUsers, totalPlaces, totalVillages, totalBookings, pendingModerations] =
      await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.place.count({ where: { deletedAt: null } }),
        prisma.village.count({ where: { deletedAt: null } }),
        prisma.booking.count(),
        prisma.villageUpdateStaging.count({ where: { status: 'PENDING_APPROVAL' } }),
      ]);

    return {
      totalUsers,
      totalPlaces,
      totalVillages,
      totalBookings,
      pendingModerations,
      systemHealth: 'OPERATIONAL',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Toggles "Book Now" CTA on Place detail pages
   */
  async togglePlaceBooking(placeId: string, enabled: boolean, experienceId?: string) {
    const place = await prisma.place.findUnique({
      where: { id: placeId },
    });

    if (!place) {
      throw new NotFoundException({
        errorCode: 'EBS_ADMIN_PLACE_NOT_FOUND',
        message: `Place with ID ${placeId} not found.`,
      });
    }

    return prisma.place.update({
      where: { id: placeId },
      data: {
        isBookingEnabled: enabled,
        ...(experienceId !== undefined ? { linkedExperienceId: experienceId } : {}),
      },
    });
  }

  /**
   * Updates Experience upfront percentage
   */
  async updateUpfrontPercentage(experienceId: string, percentage: number) {
    return prisma.experience.update({
      where: { id: experienceId },
      data: { mandatoryUpfrontPercentage: percentage },
    });
  }
}
