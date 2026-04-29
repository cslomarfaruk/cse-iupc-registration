/*
  Warnings:

  - You are about to drop the `_eventtoorganizer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_eventtoorganizer` DROP FOREIGN KEY `_EventToOrganizer_A_fkey`;

-- DropForeignKey
ALTER TABLE `_eventtoorganizer` DROP FOREIGN KEY `_EventToOrganizer_B_fkey`;

-- DropTable
DROP TABLE `_eventtoorganizer`;

-- CreateTable
CREATE TABLE `EventOrganizer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` INTEGER NOT NULL,
    `organizerId` INTEGER NOT NULL,

    UNIQUE INDEX `EventOrganizer_eventId_organizerId_key`(`eventId`, `organizerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EventOrganizer` ADD CONSTRAINT `EventOrganizer_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventOrganizer` ADD CONSTRAINT `EventOrganizer_organizerId_fkey` FOREIGN KEY (`organizerId`) REFERENCES `Organizer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
