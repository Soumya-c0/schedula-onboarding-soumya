import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class VerificationToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  otp!: string; // 6-digit code

  @Column({ default: false })
  used!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.verificationTokens, { onDelete: 'CASCADE' })
  user!: User;
}
