-- DropForeignKey
ALTER TABLE `bookmark` DROP FOREIGN KEY `Bookmark_newsId_fkey`;

-- DropIndex
DROP INDEX `Bookmark_newsId_fkey` ON `bookmark`;

-- DropIndex
DROP INDEX `News_newsId_key` ON `news`;

-- AddForeignKey
ALTER TABLE `Bookmark` ADD CONSTRAINT `Bookmark_newsId_sourceId_fkey` FOREIGN KEY (`newsId`, `sourceId`) REFERENCES `News`(`newsId`, `sourceId`) ON DELETE RESTRICT ON UPDATE CASCADE;
