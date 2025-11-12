import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';

@Injectable()
export class SlotService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
  ) {}

  async getAvailableSlots(doctorId: number, date: string) {
    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new Error('Doctor not found');

    if (doctor.scheduleType === 'wave') {
      return this.generateWaveSlots(doctor);
    } else {
      return this.generateStreamSlot(doctor);
    }
  }

  private generateWaveSlots(doctor: Doctor) {
    const start = this.timeToMinutes(doctor.consultStartTime!);
    const end = this.timeToMinutes(doctor.consultEndTime!);
    const duration = doctor.slotDuration;
    const capacity = doctor.capacityPerSlot;

    const slots = [];
    for (let t = start; t + duration <= end; t += duration) {
      const startTime = this.minutesToTime(t);
      const endTime = this.minutesToTime(t + duration);
      slots.push({
        startTime,
        endTime,
        capacity,
        available: capacity, // later subtract booked count
      });
    }
    return { scheduleType: 'wave', slots };
  }

  private generateStreamSlot(doctor: Doctor) {
    return {
      scheduleType: 'stream',
      totalCapacity: doctor.totalCapacity,
      available: doctor.totalCapacity, // later subtract booked
      slot: {
        startTime: doctor.consultStartTime,
        endTime: doctor.consultEndTime,
      },
    };
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private minutesToTime(mins: number): string {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }
}
