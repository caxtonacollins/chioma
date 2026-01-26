import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { UserProfile } from './entities/user-profile.entity';
import { IpfsService } from './ipfs.service';
import { StellarProfileService } from './stellar-profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile])],
  controllers: [ProfilesController],
  providers: [ProfilesService, IpfsService, StellarProfileService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
