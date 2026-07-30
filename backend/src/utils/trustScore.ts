import { prisma } from '../config/prisma';

export const updateTrustScore = async (userId: string, delta: number, reason: string): Promise<number> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return 85.0;

  let newScore = user.trustScore + delta;
  newScore = Math.min(100.0, Math.max(0.0, newScore));
  newScore = Math.round(newScore * 10) / 10;

  await prisma.user.update({
    where: { id: userId },
    data: { trustScore: newScore }
  });

  console.log(`[TrustScore Log] User ${user.username} (${userId}): score updated to ${newScore} (delta: ${delta}, reason: ${reason})`);
  return newScore;
};
