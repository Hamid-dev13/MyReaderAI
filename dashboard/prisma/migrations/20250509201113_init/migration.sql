-- CreateTable
CREATE TABLE "V3Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completionRate" REAL NOT NULL DEFAULT 0,
    "data" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processed',
    "v3DocumentId" TEXT,
    CONSTRAINT "UploadedFile_v3DocumentId_fkey" FOREIGN KEY ("v3DocumentId") REFERENCES "V3Document" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
