import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { FeaturesModule } from './modules/features/features.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, FeaturesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
