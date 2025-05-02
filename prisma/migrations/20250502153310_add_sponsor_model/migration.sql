-- CreateTable
CREATE TABLE "Sponsor" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "sponsoredBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sponsor_userId_sponsoredBy_key" ON "Sponsor"("userId", "sponsoredBy");
