import { Controller, Get, Post, Body, UseGuards, Req, HttpStatus, HttpCode } from '@nestjs/common';
import { FeaturesService } from './features.service';
import { ToggleFeatureDto } from './dto/toggle-feature.dto';
import { SaveSurveyResultsDto } from './dto/save-survey-results.dto';
import { AuthGuard } from '../auth/auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    name: string;
  };
}

@Controller('features')
@UseGuards(AuthGuard)
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Get('groups')
  @HttpCode(HttpStatus.OK)
  async getAllGroupsWithFeatures() {
    return await this.featuresService.getAllGroupsWithFeatures();
  }

  @Get('user-preferences')
  @HttpCode(HttpStatus.OK)
  async getUserFeaturePreferences(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return await this.featuresService.getUserFeaturePreferences(userId);
  }

  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  async toggleFeature(@Req() req: AuthenticatedRequest, @Body() toggleFeatureDto: ToggleFeatureDto) {
    const userId = req.user.sub;
    return await this.featuresService.toggleFeatureForUser(userId, toggleFeatureDto);
  }

  @Post('save-survey-results')
  @HttpCode(HttpStatus.OK)
  async saveSurveyResults(@Req() req: AuthenticatedRequest, @Body() surveyResultsDto: SaveSurveyResultsDto) {
    const userId = req.user.sub;
    return await this.featuresService.saveSurveyResults(userId, surveyResultsDto);
  }

  @Get('survey-status')
  @HttpCode(HttpStatus.OK)
  async getSurveyStatus(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return await this.featuresService.getSurveyStatus(userId);
  }
}