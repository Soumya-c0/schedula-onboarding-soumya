import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('elastic_slot')
@Index(['doctorId', 'date'], { unique: true })
export class ElasticSlot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // doctor id matches doctor.doctorId 
  @Column({ type: 'int' })
  doctorId!: number;

  // date for which slot applies (YYYY-MM-DD stored as date)
  @Column({ type: 'date' })
  date!: string;

  @Column({ type: 'varchar', default: 'wave' })
  mode!: 'wave' | 'stream' | string;

  // duration in minutes (e.g., 10, 15)
  @Column({ type: 'int', default: 10 })
  slotDuration!: number;

  // capacity: number of patients per slot/session (doctor-controlled)
  @Column({ type: 'int', default: 1 })
  capacity!: number;

  @Column({ type: 'time', nullable: true })
  sessionStartTime?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
