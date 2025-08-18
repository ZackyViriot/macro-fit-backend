import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ToggleFeatureDto } from './dto/toggle-feature.dto';
import { SaveSurveyResultsDto } from './dto/save-survey-results.dto';

@Injectable()
export class FeaturesService {
  constructor(private prisma: PrismaService) {}

  async getAllGroupsWithFeatures() {
    return this.prisma.group.findMany({
      include: {
        features: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getUserFeaturePreferences(userId: number) {
    const groups = await this.prisma.group.findMany({
      include: {
        features: {
          include: {
            userPreferences: {
              where: {
                userId: userId,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return groups.map(group => ({
      ...group,
      features: group.features.map(feature => ({
        ...feature,
        isEnabled: feature.userPreferences.length > 0
          ? feature.userPreferences[0].isEnabled
          : false, // Default to false when no user preferences exist
      })),
    }));
  }

  async toggleFeatureForUser(userId: number, toggleFeatureDto: ToggleFeatureDto) {
    const { featureId, isEnabled } = toggleFeatureDto;

    const feature = await this.prisma.feature.findUnique({
      where: { id: featureId },
    });

    if (!feature) {
      throw new NotFoundException(`Feature with ID ${featureId} not found`);
    }

    return this.prisma.userFeaturePreference.upsert({
      where: {
        userId_featureId: {
          userId,
          featureId,
        },
      },
      create: {
        userId,
        featureId,
        isEnabled,
      },
      update: {
        isEnabled,
      },
    });
  }

  async saveSurveyResults(userId: number, surveyResultsDto: SaveSurveyResultsDto) {
    const { primaryCategory, selectedCategories } = surveyResultsDto;

    // Get all groups and their features
    const allGroups = await this.prisma.group.findMany({
      include: {
        features: true,
      },
    });

    const selectedGroups = allGroups.filter(group => 
      selectedCategories.includes(group.name)
    );

    // Create feature preferences - now much simpler since defaultEnabled is false
    const featurePreferences: { userId: number; featureId: number; isEnabled: boolean }[] = [];
    
    for (const group of allGroups) {
      const isSelectedGroup = selectedCategories.includes(group.name);
      
      for (const feature of group.features) {
        // Since all features now have defaultEnabled: false, we need to decide
        // which features to enable when a user selects a group
        let shouldEnable = false;
        
        if (isSelectedGroup) {
          // You can customize this logic based on your needs:
          // Option 1: Enable no features by default (users enable manually)
          // shouldEnable = false;
          
          // Option 2: Enable a few essential features based on naming
          const featureName = feature.name.toLowerCase();
          const isEssential = 
            featureName.includes('basic') || 
            featureName.includes('core') || 
            featureName.includes('essential');
          shouldEnable = isEssential;
          
          // Option 3: Enable all features (original behavior - not recommended)
          // shouldEnable = true;
        }
        
        featurePreferences.push({
          userId,
          featureId: feature.id,
          isEnabled: shouldEnable,
        });
      }
    }

    // Use transaction to ensure all preferences are set together
    await this.prisma.$transaction(async (prisma) => {
      // Remove any existing preferences for this user
      await prisma.userFeaturePreference.deleteMany({
        where: { userId },
      });

      // Create new preferences based on survey results
      for (const preference of featurePreferences) {
        await prisma.userFeaturePreference.upsert({
          where: {
            userId_featureId: {
              userId: preference.userId,
              featureId: preference.featureId,
            },
          },
          create: preference,
          update: { isEnabled: preference.isEnabled },
        });
      }
    });

    return { success: true, message: 'Survey results saved successfully' };
  }
}