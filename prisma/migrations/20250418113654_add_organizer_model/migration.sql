-- CreateTable
CREATE TABLE `Organizer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('INSTITUTION', 'TEAM', 'GROUP', 'INDIVIDUAL') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_EventToOrganizer` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_EventToOrganizer_AB_unique`(`A`, `B`),
    INDEX `_EventToOrganizer_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_EventToOrganizer` ADD CONSTRAINT `_EventToOrganizer_A_fkey` FOREIGN KEY (`A`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EventToOrganizer` ADD CONSTRAINT `_EventToOrganizer_B_fkey` FOREIGN KEY (`B`) REFERENCES `Organizer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
