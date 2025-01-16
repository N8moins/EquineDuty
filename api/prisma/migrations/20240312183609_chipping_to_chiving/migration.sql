/*
  Warnings:

  - You are about to drop the column `nb_chipping_bags` on the `Inscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `chipping` on the `Packages` table. All the data in the column will be lost.
  - You are about to drop the column `chipping` on the `Shows_Fees` table. All the data in the column will be lost.
  - Added the required column `nb_chiving_bags` to the `Inscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chiving` to the `Shows_Fees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Inscriptions` DROP COLUMN `nb_chipping_bags`,
    ADD COLUMN `nb_chiving_bags` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Packages` DROP COLUMN `chipping`,
    ADD COLUMN `chiving` INTEGER NULL;

-- AlterTable
ALTER TABLE `Shows_Fees` DROP COLUMN `chipping`,
    ADD COLUMN `chiving` INTEGER NOT NULL;
