/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `auth_users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `auth_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `auth_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `auth_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "auth_users" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'local',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "water_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "amount_ml" INTEGER NOT NULL,

    CONSTRAINT "water_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "steps_logs" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "steps" INTEGER NOT NULL,

    CONSTRAINT "steps_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "water_logs_user_id_idx" ON "water_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "water_logs_user_id_date_key" ON "water_logs"("user_id", "date");

-- CreateIndex
CREATE INDEX "steps_logs_user_id_idx" ON "steps_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "steps_logs_user_id_date_key" ON "steps_logs"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "auth_users_email_key" ON "auth_users"("email");

-- AddForeignKey
ALTER TABLE "water_logs" ADD CONSTRAINT "water_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "steps_logs" ADD CONSTRAINT "steps_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
