-- DropIndex
DROP INDEX "Gadget_codename_key";

-- AlterTable
ALTER TABLE "Gadget" ALTER COLUMN "status" DROP DEFAULT;
