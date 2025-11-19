import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ElasticSlot } from './elastic-slot.entity';
import { Repository } from 'typeorm';
import { CreateElasticSlotDto } from './dto/create-elastic-slot.dto';
import { Appointment } from '../appointments/appointment.entity';
import { Between } from 'typeorm';

@Injectable()
export class ElasticSlotsService {
  constructor(
    @InjectRepository(ElasticSlot)
    private readonly elasticRepo: Repository<ElasticSlot>,

    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  // create or update (unique by doctorId + date)
  async upsertElasticSlot(
    doctorId: number,
    dto: CreateElasticSlotDto,
  ): Promise<ElasticSlot> {
    const { date } = dto;
    let slot = await this.elasticRepo.findOne({ where: { doctorId, date } });
    if (!slot) {
      slot = this.elasticRepo.create({
        doctorId,
        date,
        mode: dto.mode ?? 'wave',
        slotDuration: dto.slotDuration,
        capacity: dto.capacity,
        sessionStartTime: dto.sessionStartTime,
      });
    } else {
      slot.mode = dto.mode ?? slot.mode;
      slot.slotDuration = dto.slotDuration;
      slot.capacity = dto.capacity;
      slot.sessionStartTime = dto.sessionStartTime ?? slot.sessionStartTime;
    }
    return this.elasticRepo.save(slot);
  }

  // get slots info for doctor+date — includes currentBooked (count)
  async getSlotsForDoctor(doctorId: number, date: string) {
    // find an elastic config for that date
    const slot = await this.elasticRepo.findOne({ where: { doctorId, date } });
    // compute counts: appointments with scheduledAt on that date
    const startOfDay = new Date(`${date}T00:00:00Z`);
    const nextDay = new Date(startOfDay);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const bookedCount = await this.appointmentRepo.count({
      where: {
        doctorId,
        scheduledAt: Between(startOfDay, nextDay),
        // only considered non-cancelled appointments
        isCancelled: false,
      } as any, // keep types simple, typeORM will accept
    });

    if (!slot) {
      // if no elastic configuration exists, return a default info (so UI can show fallback)
      return {
        doctorId,
        date,
        exists: false,
        mode: 'wave',
        slotDuration: 10,
        capacity: 0,
        currentBooked: bookedCount,
      };
    }

    return {
      ...slot,
      exists: true,
      currentBooked: bookedCount,
    };
  }
}
