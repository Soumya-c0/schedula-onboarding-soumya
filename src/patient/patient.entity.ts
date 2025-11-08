import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';
import { Doctor } from '../doctor/doctor.entity';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  condition!: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.id)
  doctor!: Doctor;

  @ManyToOne(() => User, (user) => user.patients)
  user!: User;
}
