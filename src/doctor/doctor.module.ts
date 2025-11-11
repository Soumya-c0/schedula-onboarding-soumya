import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './doctor.entity';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, User])],
  providers: [DoctorService],
  controllers: [DoctorController],
  exports: [DoctorService],
})
export class DoctorModule {}
