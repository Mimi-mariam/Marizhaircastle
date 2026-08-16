-- CreateEnum
CREATE TYPE "CustomWigStatus" AS ENUM ('RECEIVED', 'IN_REVIEW', 'CONFIRMED', 'COMPLETED', 'DECLINED');

-- CreateTable
CREATE TABLE "CustomWigRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "wigType" TEXT NOT NULL,
    "laceSize" TEXT NOT NULL,
    "bundles" TEXT NOT NULL,
    "capSize" TEXT NOT NULL,
    "length" TEXT,
    "styleInspoUrl" TEXT,
    "colorInspoUrl" TEXT,
    "notes" TEXT,
    "status" "CustomWigStatus" NOT NULL DEFAULT 'RECEIVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomWigRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomWigRequest_status_idx" ON "CustomWigRequest"("status");

-- CreateIndex
CREATE INDEX "CustomWigRequest_createdAt_idx" ON "CustomWigRequest"("createdAt");
