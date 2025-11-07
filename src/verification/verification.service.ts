import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationToken } from './verification.entity';
import { User } from '../user/user.entity';
import { randomInt } from 'crypto';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationToken)
    private tokensRepo: Repository<VerificationToken>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  /**
   * Generate a random 6-digit OTP
   */
  private generateOtp(): string {
    return String(randomInt(100000, 999999));
  }

  /**
   * Send OTP for user verification
   */
  async sendVerification(userId: string, method: 'email' | 'sms' = 'email') {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

    const token = this.tokensRepo.create({
      user,
      otp,
      expiresAt,
      used: false,
    });

    await this.tokensRepo.save(token);

    // Simulate sending OTP (log it for now)
    console.log(
      `✅ Verification OTP for ${user.email}: ${otp} (expires ${expiresAt.toISOString()}) via ${method}`,
    );

    return { message: 'OTP sent successfully', expiresAt };
  }

  /**
   * Confirm OTP and verify user
   */
  async confirmOtp(userId: string, otp: string) {
    const token = await this.tokensRepo.findOne({
      where: { otp, used: false },
      relations: ['user'],
    });

    if (!token) throw new Error('Invalid OTP');
    if (token.user.id !== userId)
      throw new Error('OTP does not belong to the provided user');
    if (token.expiresAt && token.expiresAt.getTime() < Date.now())
      throw new Error('OTP expired');

    // Mark OTP as used
    token.used = true;
    await this.tokensRepo.save(token);

    // Mark user as verified
    const user = token.user;
    user.isVerified = true;
    await this.usersRepo.save(user);

    console.log(`✅ User ${user.email} verified successfully.`);

    return { message: 'User verified successfully', userId: user.id };
  }
}
