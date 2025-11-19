import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticSlot } from './elastic-slot.entity';
import { ElasticSlotsService } from './elastic-slots.service';
import { ElasticSlotsController } from './elastic-slots.controller';
import { Appointment } from '../appointments/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ElasticSlot, Appointment])],
  providers: [ElasticSlotsService],
  controllers: [ElasticSlotsController],
  exports: [ElasticSlotsService],
})
export class ElasticModule {}
