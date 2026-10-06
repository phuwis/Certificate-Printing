-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FileAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FileAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT,
    "name" TEXT NOT NULL,
    "course" TEXT,
    "date" TEXT,
    "location" TEXT,
    "description" TEXT,
    "host" TEXT,
    "objectives" TEXT,
    "criterias" TEXT,
    "files" TEXT,
    "templatePdf" TEXT NOT NULL DEFAULT 'nbt-69-gen1.pdf',
    "recipientsFile" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ARCHIVE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PdfTemplateConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "nameX" REAL NOT NULL DEFAULT 0,
    "nameY" REAL NOT NULL DEFAULT 0,
    "nameFontSize" INTEGER NOT NULL DEFAULT 24,
    "nameColor" TEXT NOT NULL DEFAULT '#000000',
    "positionX" REAL,
    "positionY" REAL,
    "positionFontSize" INTEGER DEFAULT 16,
    "positionColor" TEXT DEFAULT '#000000',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PdfTemplateConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Graduate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "prefix" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT,
    "department" TEXT,
    "idCardLast4" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Graduate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PageLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT,
    "action" TEXT NOT NULL,
    "searchQuery" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PageLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CertificateLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "graduateId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "templateUsed" TEXT NOT NULL,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CertificateLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CertificateLog_graduateId_fkey" FOREIGN KEY ("graduateId") REFERENCES "Graduate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "FileAsset_projectId_idx" ON "FileAsset"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PdfTemplateConfig_projectId_key" ON "PdfTemplateConfig"("projectId");

-- CreateIndex
CREATE INDEX "Graduate_projectId_idx" ON "Graduate"("projectId");

-- CreateIndex
CREATE INDEX "Graduate_firstName_lastName_idx" ON "Graduate"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "PageLog_projectId_idx" ON "PageLog"("projectId");

-- CreateIndex
CREATE INDEX "PageLog_action_idx" ON "PageLog"("action");

-- CreateIndex
CREATE INDEX "PageLog_createdAt_idx" ON "PageLog"("createdAt");

-- CreateIndex
CREATE INDEX "CertificateLog_projectId_idx" ON "CertificateLog"("projectId");

-- CreateIndex
CREATE INDEX "CertificateLog_graduateId_idx" ON "CertificateLog"("graduateId");

-- CreateIndex
CREATE INDEX "CertificateLog_createdAt_idx" ON "CertificateLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_userId_idx" ON "AdminAuditLog"("userId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");
