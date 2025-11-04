import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Patient } from '../patient/patient.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  specialization!: string;

  @OneToMany(() => Patient, (patient) => patient.doctor)
  patients!: Patient[];
}
