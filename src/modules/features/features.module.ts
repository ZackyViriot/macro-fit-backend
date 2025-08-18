import { Module } from '@nestjs/common';
import { FeaturesController } from './features.controller';
import { FeaturesService } from './features.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [FeaturesController],
  providers: [FeaturesService],
})
export class FeaturesModule {}