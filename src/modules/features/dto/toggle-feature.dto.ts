import { IsBoolean, IsInt } from 'class-validator';

export class ToggleFeatureDto {
  @IsInt()
  featureId: number;

  @IsBoolean()
  isEnabled: boolean;
}