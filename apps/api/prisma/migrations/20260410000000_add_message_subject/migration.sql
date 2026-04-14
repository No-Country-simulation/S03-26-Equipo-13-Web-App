-- AlterTable: agrega campo subject opcional a Message para emails
ALTER TABLE "Message" ADD COLUMN "subject" TEXT;
