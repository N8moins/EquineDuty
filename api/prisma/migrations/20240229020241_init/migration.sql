-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `birthdate` DATETIME(3) NULL,
    `role` ENUM('USER', 'SECRETARY', 'ORGANIZER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrganizerShows` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `remaining_shows` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OrganizerShows_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StripeAccountUsers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `stripe_account_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StripeAccountUsers_user_id_key`(`user_id`),
    UNIQUE INDEX `StripeAccountUsers_stripe_account_id_key`(`stripe_account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `street_address` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `zip_code` VARCHAR(191) NOT NULL,
    `other_information` VARCHAR(191) NULL,
    `organizer_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Packages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `tack_stalls` INTEGER NULL,
    `stalls` INTEGER NULL,
    `hays` INTEGER NULL,
    `chipping` INTEGER NULL,
    `price` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shows_Packages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `show_id` INTEGER NOT NULL,
    `package_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shows` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `address_id` INTEGER NOT NULL,
    `organizer_id` INTEGER NOT NULL,
    `path_logo` VARCHAR(191) NULL,
    `nb_total_place` INTEGER NOT NULL,
    `nb_free_place` INTEGER NOT NULL,
    `nb_temp_stalls` INTEGER NOT NULL,
    `nb_permanent_stalls` INTEGER NOT NULL,
    `nb_tack_stalls` INTEGER NOT NULL,
    `nb_free_temp_stalls` INTEGER NOT NULL,
    `nb_free_permanent_stalls` INTEGER NOT NULL,
    `nb_free_tack_stalls` INTEGER NOT NULL,
    `show_fee_id` INTEGER NOT NULL,
    `administration_fee_id` INTEGER NOT NULL,
    `recognized_show` BOOLEAN NOT NULL DEFAULT false,
    `rules` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `inscription_start_date` DATETIME(3) NOT NULL,
    `inscription_end_date` DATETIME(3) NOT NULL,
    `inscription_end_late_date` DATETIME(3) NULL,
    `is_vaccination_proof_required` BOOLEAN NOT NULL,
    `is_coggins_proof_required` BOOLEAN NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `secretary_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shows_Fees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hay` INTEGER NOT NULL,
    `chipping` INTEGER NOT NULL,
    `temp_stall_per_day` INTEGER NOT NULL,
    `permanent_stall_per_day` INTEGER NOT NULL,
    `tack_stall_per_day` INTEGER NOT NULL,
    `drug_test` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerifyTokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `user_id` INTEGER NOT NULL,

    UNIQUE INDEX `VerifyTokens_token_key`(`token`),
    UNIQUE INDEX `VerifyTokens_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Administration_Fees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `administration` INTEGER NOT NULL,
    `late_inscription` INTEGER NOT NULL,
    `cancel_inscription` INTEGER NOT NULL,
    `ground` INTEGER NOT NULL,
    `paramedics` INTEGER NOT NULL,
    `camper_ground_rental` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Other_Fees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` INTEGER NOT NULL,
    `type` ENUM('SHOW', 'ADMINISTRATION') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `short_name` VARCHAR(191) NOT NULL,
    `points_precision` INTEGER NOT NULL,
    `duration_minute` INTEGER NOT NULL,
    `nb_standard_marks` INTEGER NULL,
    `nb_collectives_marks` INTEGER NULL,
    `total_points_possibility` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Marks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `move_name` VARCHAR(191) NOT NULL,
    `note` INTEGER NOT NULL,
    `coef_points` DOUBLE NOT NULL,
    `type` ENUM('STANDARD', 'COLLECTIVE') NOT NULL DEFAULT 'STANDARD',
    `test_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Classes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `number` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `ring_name` VARCHAR(191) NOT NULL,
    `ring_number` VARCHAR(191) NOT NULL,
    `price_entry` INTEGER NOT NULL,
    `show_id` INTEGER NOT NULL,
    `test_id` INTEGER NOT NULL DEFAULT 0,
    `level_type` VARCHAR(191) NOT NULL,
    `is_test_of_choice` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Horses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `sex` VARCHAR(191) NOT NULL,
    `no_fei` VARCHAR(191) NULL,
    `no_micro_chip` VARCHAR(191) NULL,
    `path_vaccine` VARCHAR(191) NULL,
    `path_coggins` VARCHAR(191) NULL,
    `name_owner` VARCHAR(191) NOT NULL,
    `fei_owner` VARCHAR(191) NULL,
    `email_owner` VARCHAR(191) NOT NULL,
    `phone_owner` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Riders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `no_fei` VARCHAR(191) NULL,
    `emergency_name` VARCHAR(191) NOT NULL,
    `emergency_phone` VARCHAR(191) NOT NULL,
    `stable_name` VARCHAR(191) NOT NULL,
    `trainer_name` VARCHAR(191) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inscriptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `horse_id` INTEGER NOT NULL,
    `rider_id` INTEGER NOT NULL,
    `show_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `no_fei` VARCHAR(191) NULL,
    `nb_stalls` INTEGER NOT NULL,
    `nb_tack_stalls` INTEGER NOT NULL,
    `nb_hay_bale` INTEGER NOT NULL,
    `nb_chipping_bags` INTEGER NOT NULL,
    `stall_type` ENUM('TEMPORARY', 'PERMANENT') NOT NULL,
    `nb_days` INTEGER NOT NULL,
    `total` INTEGER NOT NULL,
    `has_payed` BOOLEAN NOT NULL DEFAULT false,
    `invoice_number` VARCHAR(191) NULL,
    `approved` BOOLEAN NOT NULL DEFAULT false,
    `rider_entry_number` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Classes_Inscriptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `class_id` INTEGER NOT NULL,
    `inscription_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Classes_Inscriptions_inscription_id_key`(`inscription_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shows_Asked_Codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `show_id` INTEGER NOT NULL,
    `asked_code_name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inscriptions_Asked_Codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code_name` VARCHAR(191) NOT NULL,
    `inscription_id` INTEGER NOT NULL,
    `code_value` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inscriptions_Packages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inscription_id` INTEGER NOT NULL,
    `package_id` INTEGER NOT NULL,
    `nb_packages` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Judges_Classes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `class_id` INTEGER NOT NULL,
    `ring_name` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `ring_position` ENUM('E', 'H', 'C', 'M', 'B') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `test_id` INTEGER NOT NULL,
    `rider_id` INTEGER NOT NULL,
    `horse_id` INTEGER NOT NULL,
    `horse_name` VARCHAR(191) NOT NULL,
    `rider_name` VARCHAR(191) NOT NULL,
    `score` DOUBLE NOT NULL,
    `nb_errors` INTEGER NOT NULL,
    `reason` ENUM('ELEMINATED', 'HC', 'NO_SHOW', 'RETIRED', 'SCRATCH', 'VET_OUT', 'WITHDREW') NOT NULL,
    `judge_id` INTEGER NOT NULL,
    `rider_entry_number` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshTokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `user_id` INTEGER NOT NULL,

    UNIQUE INDEX `RefreshTokens_token_key`(`token`),
    UNIQUE INDEX `RefreshTokens_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `show_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ring_Schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `schedule_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `start_time` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Class_Schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ring_schedule_id` INTEGER NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `duration_minute` INTEGER NOT NULL,
    `test` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Riders_Schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `class_schedule_id` INTEGER NOT NULL,
    `rider_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `time_start` VARCHAR(191) NOT NULL,
    `horse_name` VARCHAR(191) NOT NULL,
    `horse_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Judges_Schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `class_schedule_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `position` ENUM('E', 'H', 'C', 'M', 'B') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrganizerShows` ADD CONSTRAINT `OrganizerShows_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StripeAccountUsers` ADD CONSTRAINT `StripeAccountUsers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_organizer_id_fkey` FOREIGN KEY (`organizer_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shows_Packages` ADD CONSTRAINT `Shows_Packages_show_id_fkey` FOREIGN KEY (`show_id`) REFERENCES `Shows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shows_Packages` ADD CONSTRAINT `Shows_Packages_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `Packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shows` ADD CONSTRAINT `Shows_address_id_fkey` FOREIGN KEY (`address_id`) REFERENCES `Address`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shows` ADD CONSTRAINT `Shows_organizer_id_fkey` FOREIGN KEY (`organizer_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shows` ADD CONSTRAINT `Shows_show_fee_id_fkey` FOREIGN KEY (`show_fee_id`) REFERENCES `Shows_Fees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shows` ADD CONSTRAINT `Shows_administration_fee_id_fkey` FOREIGN KEY (`administration_fee_id`) REFERENCES `Administration_Fees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shows` ADD CONSTRAINT `Shows_secretary_id_fkey` FOREIGN KEY (`secretary_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VerifyTokens` ADD CONSTRAINT `VerifyTokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tests` ADD CONSTRAINT `Tests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Marks` ADD CONSTRAINT `Marks_test_id_fkey` FOREIGN KEY (`test_id`) REFERENCES `Tests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Classes` ADD CONSTRAINT `Classes_show_id_fkey` FOREIGN KEY (`show_id`) REFERENCES `Shows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Classes` ADD CONSTRAINT `Classes_test_id_fkey` FOREIGN KEY (`test_id`) REFERENCES `Tests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Horses` ADD CONSTRAINT `Horses_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Riders` ADD CONSTRAINT `Riders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscriptions` ADD CONSTRAINT `Inscriptions_horse_id_fkey` FOREIGN KEY (`horse_id`) REFERENCES `Horses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscriptions` ADD CONSTRAINT `Inscriptions_rider_id_fkey` FOREIGN KEY (`rider_id`) REFERENCES `Riders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscriptions` ADD CONSTRAINT `Inscriptions_show_id_fkey` FOREIGN KEY (`show_id`) REFERENCES `Shows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscriptions` ADD CONSTRAINT `Inscriptions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Classes_Inscriptions` ADD CONSTRAINT `Classes_Inscriptions_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `Classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Classes_Inscriptions` ADD CONSTRAINT `Classes_Inscriptions_inscription_id_fkey` FOREIGN KEY (`inscription_id`) REFERENCES `Inscriptions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Shows_Asked_Codes` ADD CONSTRAINT `Shows_Asked_Codes_show_id_fkey` FOREIGN KEY (`show_id`) REFERENCES `Shows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscriptions_Asked_Codes` ADD CONSTRAINT `Inscriptions_Asked_Codes_inscription_id_fkey` FOREIGN KEY (`inscription_id`) REFERENCES `Inscriptions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscriptions_Packages` ADD CONSTRAINT `Inscriptions_Packages_inscription_id_fkey` FOREIGN KEY (`inscription_id`) REFERENCES `Inscriptions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inscriptions_Packages` ADD CONSTRAINT `Inscriptions_Packages_package_id_fkey` FOREIGN KEY (`package_id`) REFERENCES `Packages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Judges_Classes` ADD CONSTRAINT `Judges_Classes_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `Classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Results` ADD CONSTRAINT `Results_test_id_fkey` FOREIGN KEY (`test_id`) REFERENCES `Tests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Results` ADD CONSTRAINT `Results_judge_id_fkey` FOREIGN KEY (`judge_id`) REFERENCES `Judges_Classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Results` ADD CONSTRAINT `Results_rider_id_fkey` FOREIGN KEY (`rider_id`) REFERENCES `Riders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Results` ADD CONSTRAINT `Results_horse_id_fkey` FOREIGN KEY (`horse_id`) REFERENCES `Horses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefreshTokens` ADD CONSTRAINT `RefreshTokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_show_id_fkey` FOREIGN KEY (`show_id`) REFERENCES `Shows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ring_Schedule` ADD CONSTRAINT `Ring_Schedule_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Class_Schedule` ADD CONSTRAINT `Class_Schedule_ring_schedule_id_fkey` FOREIGN KEY (`ring_schedule_id`) REFERENCES `Ring_Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Riders_Schedule` ADD CONSTRAINT `Riders_Schedule_class_schedule_id_fkey` FOREIGN KEY (`class_schedule_id`) REFERENCES `Class_Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Judges_Schedule` ADD CONSTRAINT `Judges_Schedule_class_schedule_id_fkey` FOREIGN KEY (`class_schedule_id`) REFERENCES `Class_Schedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
