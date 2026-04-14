/*
  Warnings:

  - The `status` column on the `Contact` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `FlowExecution` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `channel` column on the `Message` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Message` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `token` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[wamid]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `direction` on the `Message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'agent');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('new', 'active', 'inactive', 'archived');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('pending', 'in_progress', 'done', 'cancelled');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('inbound', 'outbound');

-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('whatsapp', 'email', 'sms');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('sent', 'delivered', 'read', 'failed');

-- CreateEnum
CREATE TYPE "FlowExecutionStatus" AS ENUM ('running', 'completed', 'failed', 'cancelled');

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "status",
ADD COLUMN     "status" "ContactStatus" NOT NULL DEFAULT 'new';

-- AlterTable
ALTER TABLE "FlowExecution" DROP COLUMN "status",
ADD COLUMN     "status" "FlowExecutionStatus" NOT NULL DEFAULT 'running';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "wamid" TEXT,
DROP COLUMN "direction",
ADD COLUMN     "direction" "MessageDirection" NOT NULL,
DROP COLUMN "channel",
ADD COLUMN     "channel" "MessageChannel" NOT NULL DEFAULT 'whatsapp',
DROP COLUMN "status",
ADD COLUMN     "status" "MessageStatus" NOT NULL DEFAULT 'sent';

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "status",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "token",
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'agent';

-- CreateIndex
CREATE UNIQUE INDEX "Message_wamid_key" ON "Message"("wamid");
