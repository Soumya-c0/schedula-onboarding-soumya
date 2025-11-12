// src/doctor/doctor.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  specialization!: string;

  @Column()
  experience!: number;

  // 🕒 Scheduling fields
  @Column({ default: 'wave' })
  scheduleType!: 'wave' | 'stream';

  @Column({ type: 'time', nullable: true })
  consultStartTime!: string; // e.g. '09:00'

  @Column({ type: 'time', nullable: true })
  consultEndTime!: string;   // e.g. '17:00'

  @Column({ type: 'int', default: 30 })
  slotDuration!: number; // in minutes (used only for wave)

  @Column({ type: 'int', default: 1 })
  capacityPerSlot!: number; // number of patients per slot (wave)

  @Column({ type: 'int', default: 10 })
  totalCapacity!: number; // total patients for stream scheduling

  @ManyToOne(() => User, (user) => user.doctors)
  user!: User;
}
