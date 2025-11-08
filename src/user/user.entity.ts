// src/user/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Doctor } from '../doctor/doctor.entity';
import { Patient } from '../patient/patient.entity';

export type UserRole = 'doctor' | 'patient';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  provider?: string; // 'google'

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Column({ type: 'varchar', default: 'patient' })
  role!: UserRole;

  @OneToMany(() => Doctor, (doctor) => doctor.user)
  doctors!: Doctor[];

  @OneToMany(() => Patient, (patient) => patient.user)
  patients!: Patient[];
}
