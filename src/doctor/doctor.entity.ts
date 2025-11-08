import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  specialization!: string;

  @Column()
  experience!: number; // Added new field for experience (in years)

  @ManyToOne(() => User, (user) => user.doctors)
  user!: User;
}
