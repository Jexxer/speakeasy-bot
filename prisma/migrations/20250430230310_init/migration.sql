-- CreateTable
CREATE TABLE "Vouch" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "vouchedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vouch_pkey" PRIMARY KEY ("id")
);
