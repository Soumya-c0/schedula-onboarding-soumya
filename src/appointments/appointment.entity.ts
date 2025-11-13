import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Doctor } from '../doctor/doctor.entity';
import { Patient } from '../patient/patient.entity';
import { User } from '../user/user.entity';

export type AppointmentStatus = 'confirmed' | 'cancelled' | 'completed';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Doctor, (d) => d.id, { eager: true })
  doctor!: Doctor;

  @ManyToOne(() => Patient, (p) => p.id, { eager: true, nullable: true })
  patient?: Patient;

  // user who booked (patient user) — store for quick access
  @ManyToOne(() => User, (u) => u.id, { eager: true })
  user!: User;

  // scheduled time (date + time in DB) — when appointment starts
  @Column({ type: 'timestamp' })
  scheduledAt!: Date;

  @Column({ type: 'varchar', length: 20 })
  scheduleKind!: 'wave' | 'stream';

  @Column({ type: 'varchar', default: 'confirmed' })
  status!: AppointmentStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
