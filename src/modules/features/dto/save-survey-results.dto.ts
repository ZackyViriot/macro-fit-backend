import { IsArray, IsString } from 'class-validator';

export class SaveSurveyResultsDto {
  @IsString()
  primaryCategory: string;

  @IsArray()
  @IsString({ each: true })
  selectedCategories: string[];
}