import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Appointment } from './appointment.entity';
import { Doctor } from '../doctor/doctor.entity';
import { Patient } from '../patient/patient.entity';
import { User } from '../user/user.entity';
import { SelectTimeDto } from './dto/select-time.dto';
import { parse } from 'date-fns';

@Injectable()
export class AppointmentsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Appointment) private apptRepo: Repository<Appointment>,
    @InjectRepository(Doctor) private doctorRepo: Repository<Doctor>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // helper to build a Date object on the requested date with HH:mm
  private buildDateFromParts(dateStr: string, timeHHMM: string | Date) : Date {
    // dateStr is YYYY-MM-DD
    if (!dateStr) throw new Error('dateStr is required');
    if (timeHHMM instanceof Date) {
    const h = String(timeHHMM.getHours()).padStart(2, '0');
      const m = String(timeHHMM.getMinutes()).padStart(2, '0');
      const combined = `${dateStr}T${h}:${m}:00`;
      const dt = new Date(combined);
      if (isNaN(dt.getTime())) throw new Error(`Failed to parse date from: ${combined}`);
      return dt;
  }
   if (typeof timeHHMM === 'string') {
      // normalize to HH:mm
      const time = timeHHMM.trim();
      // if format 'HH:mm:ss' -> keep first 5 chars to get 'HH:mm'
      const hhmm = time.length >= 5 ? time.slice(0, 5) : time;
      // validate simple pattern
      if (!/^\d{2}:\d{2}$/.test(hhmm)) {
        throw new Error(`Invalid time format (expected HH:mm or HH:mm:ss): ${timeHHMM}`);
      }
      const combined = `${dateStr}T${hhmm}:00`;
      const dt = new Date(combined);
      if (isNaN(dt.getTime())) throw new Error(`Failed to parse date from: ${combined}`);
      return dt;
    }
    throw new Error(`Unsupported time type: ${typeof timeHHMM}`);
    return parse(`${dateStr} ${timeHHMM}`, 'yyyy-MM-dd HH:mm', new Date());
  }

  // main API: request to select/assign a slot
  async selectTime(payload: SelectTimeDto & { date: string }) {
    const { doctorId, userId, slotTime, date } = payload;

    const doctor = await this.doctorRepo.findOne({ where: { id: Number(doctorId) }});
    if (!doctor) throw new BadRequestException('Doctor not found');

    const user = await this.userRepo.findOne({ where: { id: userId }});
    if (!user) throw new BadRequestException('User not found');

    // validate user is a patient (role)
    if (user.role !== 'patient') throw new BadRequestException('Only patients can book');

    // For wave scheduling: client should provide slotTime (HH:mm)
    if (doctor.scheduleType === 'wave') {
      if (!slotTime) throw new BadRequestException('slotTime required for wave scheduling');

      // scheduledAt = combine date + slotTime
      console.log('DEBUG doctor times:', doctor.consultStartTime, doctor.consultEndTime);
      const scheduledAt = this.buildDateFromParts(date, slotTime);

      // run in transaction to avoid race
      return await this.dataSource.transaction(async (manager) => {
        // count existing appointments for this doctor + scheduledAt
        const count = await manager.getRepository(Appointment).count({
          where: {
            doctor: { id: doctor.id },
            scheduledAt,
            status: 'confirmed',
          },
        });

        if (count >= doctor.capacityPerSlot) {
          throw new ConflictException('Slot is full');
        }

        const appt = manager.getRepository(Appointment).create({
          doctor,
          user,
          scheduledAt,
          scheduleKind: 'wave',
          status: 'confirmed',
        });

        return await manager.getRepository(Appointment).save(appt);
      });
    }

    // For stream scheduling: auto assign next available time
    if (doctor.scheduleType === 'stream') {
  if (!doctor.consultStartTime || !doctor.consultEndTime) {
    throw new BadRequestException('Doctor consultation times are not configured');
  }

  return await this.dataSource.transaction(async (manager) => {

    const dayStart = this.buildDateFromParts(date, doctor.consultStartTime);
    const dayEnd = this.buildDateFromParts(date, doctor.consultEndTime);

    const qb = manager.getRepository(Appointment).createQueryBuilder('a')
      .where('a.doctorId = :doctorId', { doctorId: doctor.id })
      .andWhere('a.scheduledAt >= :dayStart', { dayStart })
      .andWhere('a.scheduledAt <= :dayEnd', { dayEnd })
      .andWhere('a.status = :status', { status: 'confirmed' });

    const dayAppointments = await qb.getMany();

    const nextTime = new Date(dayStart.getTime() + (dayAppointments.length * doctor.slotDuration * 60 * 1000));

    if (nextTime.getTime() > dayEnd.getTime()) {
      throw new ConflictException('No available time in doctor schedule');
    }

    const appt = manager.getRepository(Appointment).create({
      doctor,
      user,
      scheduledAt: nextTime,
      scheduleKind: 'stream',
      status: 'confirmed',
    });

    return await manager.getRepository(Appointment).save(appt);
  });
}


    throw new BadRequestException('Unsupported scheduleType');
  }

  async getAppointmentById(id: string) {
    const a = await this.apptRepo.findOne({ where: { id }});
    if (!a) throw new BadRequestException('Appointment not found');
    return a;
  }
}
