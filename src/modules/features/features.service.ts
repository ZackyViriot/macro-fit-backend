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
          : feature.defaultEnabled, // Use feature's defaultEnabled when no user preferences exist
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

  // Add this method to check survey status
  async getSurveyStatus(userId: number) {
    const userPreferences = await this.prisma.userFeaturePreference.findMany({
      where: { userId },
      include: {
        feature: {
          include: {
            group: true
          }
        }
      }
    });

    // If user has any feature preferences, they've completed the survey
    const hasCompletedSurvey = userPreferences.length > 0;
    
    return {
      hasCompletedSurvey,
      preferenceCount: userPreferences.length,
      groups: userPreferences.map(p => p.feature.group.name)
    };
  }

  async saveSurveyResults(userId: number, surveyResultsDto: SaveSurveyResultsDto) {
    const { primaryCategory, selectedCategories } = surveyResultsDto;
    
    console.log('=== SURVEY RESULTS DEBUG ===');
    console.log('User ID:', userId);
    console.log('Primary Category:', primaryCategory);
    console.log('Selected Categories:', selectedCategories);

    // First, ensure we have the necessary groups and features
    await this.ensureSurveyGroupsExist();

    // Get all groups and their features
    const allGroups = await this.prisma.group.findMany({
      include: {
        features: true,
      },
    });

    console.log('=== SURVEY DEBUG ===');
    console.log('User ID:', userId);
    console.log('Selected categories from survey:', selectedCategories);
    console.log('Available groups in database:');
    allGroups.forEach(group => {
      console.log(`- Group ID ${group.id}: "${group.name}"`);
    });

    const selectedGroups = allGroups.filter(group => 
      selectedCategories.includes(group.name)
    );

    console.log('Matched groups:', selectedGroups.map(g => `${g.id}: "${g.name}"`));
    console.log('==================');

    // Create feature preferences - now much simpler since defaultEnabled is false
    const featurePreferences: { userId: number; featureId: number; isEnabled: boolean }[] = [];
    
    for (const group of allGroups) {
      const isSelectedGroup = selectedCategories.includes(group.name);
      console.log(`Group "${group.name}" - Is Selected: ${isSelectedGroup}`);
      
      for (const feature of group.features) {
        // Since all features now have defaultEnabled: false, we need to decide
        // which features to enable when a user selects a group
        let shouldEnable = false;
        
        if (isSelectedGroup) {
          // Enable all features for selected groups to ensure users have functionality
          shouldEnable = true;
        }
        
        featurePreferences.push({
          userId,
          featureId: feature.id,
          isEnabled: shouldEnable,
        });

        console.log(`Feature "${feature.name}" (ID: ${feature.id}) in group "${group.name}": ${shouldEnable ? 'ENABLED' : 'DISABLED'}`);        
      }
    }

    console.log('Feature Preferences to Create:', featurePreferences);

    // Use transaction to ensure all preferences are set together
    await this.prisma.$transaction(async (prisma) => {
      // Remove any existing preferences for this user
      const deletedCount = await prisma.userFeaturePreference.deleteMany({
        where: { userId },
      });
      console.log(`Deleted ${deletedCount.count} existing preferences for user ${userId}`);

      // Create new preferences based on survey results
      for (const preference of featurePreferences) {
        const result = await prisma.userFeaturePreference.upsert({
          where: {
            userId_featureId: {
              userId: preference.userId,
              featureId: preference.featureId,
            },
          },
          create: preference,
          update: { isEnabled: preference.isEnabled },
        });
        console.log(`Created/Updated preference for feature ${preference.featureId}: enabled=${preference.isEnabled}`);
      }
    });

    console.log('=== SURVEY RESULTS SAVED SUCCESSFULLY ===');
    return { success: true, message: 'Survey results saved successfully' };
  }

  // Helper method to ensure survey groups exist
  private async ensureSurveyGroupsExist() {
    const surveyGroups = [
      { name: 'Wellness', description: 'Health and wellness features' },
      { name: 'Nutrition & Cooking', description: 'Nutrition tracking and recipe features' },
      { name: 'Body Transformation', description: 'Workout and fitness tracking features' }
    ];

    for (const groupData of surveyGroups) {
      let group = await this.prisma.group.findFirst({
        where: { name: groupData.name }
      });

      if (!group) {
        console.log(`Creating group: ${groupData.name}`);
        group = await this.prisma.group.create({
          data: {
            name: groupData.name,
            description: groupData.description,
            features: {
              create: [
                { name: `${groupData.name} Basic Feature`, description: 'Basic feature for this category' },
                { name: `${groupData.name} Advanced Feature`, description: 'Advanced feature for this category' },
                { name: `${groupData.name} Core Feature`, description: 'Core feature for this category' }
              ]
            }
          }
        });
        console.log(`Created group "${group.name}" with features`);
      } else {
        console.log(`Group "${group.name}" already exists`);
      }
    }
  }
}