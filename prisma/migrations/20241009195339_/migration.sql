/*
  Warnings:

  - You are about to drop the `generateText` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "generateText";

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "topic" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "length" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);
