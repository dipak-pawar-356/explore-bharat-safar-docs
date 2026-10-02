import { prisma } from '@ebs/database';

/**
 * 24-Hour Ephemeral Story Lifecycle Cleanup Processor
 * Archives stories past their expires_at timestamp
 */
export async function processStoryArchival() {
  const now = new Date();

  const result = await prisma.temporaryStory.updateMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { lte: now },
    },
    data: {
      status: 'ARCHIVED',
    },
  });

  if (result.count > 0) {
    console.info(`⏱️ Archived ${result.count} expired 24h stories.`);
  }

  return result.count;
}
