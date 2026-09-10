import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

const FREE_POINTS = 5;
const GENERATION_COST = 1;
const PRO_POINTS = 100;
const DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

async function getLimits() {
  const { has } = await auth();
  const hasProAccess = has({ plan: "pro" });
  return {
    points: hasProAccess ? PRO_POINTS : FREE_POINTS,
  };
}

async function getUserId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
}

function msUntil(expire: Date | null) {
  if (!expire) {
    return 0;
  }
  return Math.max(0, expire.getTime() - Date.now());
}

export async function consumeCredits() {
  const userId = await getUserId();
  const { points: maxPoints } = await getLimits();
  const now = new Date();

  const existing = await prisma.usage.findUnique({
    where: { key: userId },
  });

  const isExpired = existing?.expire && existing.expire <= now;

  if (!existing || isExpired) {
    const expire = new Date(now.getTime() + DURATION_MS);
    const record = await prisma.usage.upsert({
      where: { key: userId },
      update: { points: maxPoints - GENERATION_COST, expire },
      create: {
        key: userId,
        points: maxPoints - GENERATION_COST,
        expire,
      },
    });
    return {
      remainingPoints: record.points,
      msBeforeNext: msUntil(record.expire) || DURATION_MS,
    };
  }

  if (existing.points <= 0) {
    throw Object.assign(new Error("You have run out of credits"), {
      msBeforeNext: msUntil(existing.expire),
      remainingPoints: 0,
    });
  }

  const record = await prisma.usage.update({
    where: { key: userId },
    data: { points: { decrement: GENERATION_COST } },
  });
  return {
    remainingPoints: record.points,
    msBeforeNext: msUntil(record.expire),
  };
}

export async function getUsageStatus() {
  const userId = await getUserId();
  const { points: maxPoints } = await getLimits();

  const existing = await prisma.usage.findUnique({
    where: { key: userId },
  });

  const now = new Date();
  const isExpired = existing?.expire && existing.expire <= now;

  if (!existing || isExpired) {
    return {
      remainingPoints: maxPoints,
      msBeforeNext: DURATION_MS,
    };
  }

  return {
    remainingPoints: existing.points,
    msBeforeNext: msUntil(existing.expire),
  };
}