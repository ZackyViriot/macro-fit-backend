-- CreateTable
CREATE TABLE "public"."Group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Feature" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "groupId" INTEGER NOT NULL,
    "defaultEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserFeaturePreference" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "featureId" INTEGER NOT NULL,
    "isEnabled" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFeaturePreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserFeaturePreference_userId_featureId_key" ON "public"."UserFeaturePreference"("userId", "featureId");

-- AddForeignKey
ALTER TABLE "public"."Feature" ADD CONSTRAINT "Feature_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserFeaturePreference" ADD CONSTRAINT "UserFeaturePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserFeaturePreference" ADD CONSTRAINT "UserFeaturePreference_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "public"."Feature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
