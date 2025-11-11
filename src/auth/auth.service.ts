import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async findOrCreateFromGoogle(profile: { id: string; displayName?: string; emails?: { value: string }[] }, role: 'doctor' | 'patient') {
    const email = profile.emails?.[0]?.value;
    if (!email) throw new Error('Google profile has no email');

    let user = await this.usersRepo.findOne({ where: { email } });

    if (!user) {
      user = this.usersRepo.create({
        name: profile.displayName || email,
        email,
        provider: 'google',
        password: undefined,
        role,
      });
      user = await this.usersRepo.save(user);
    } else {
      // update provider/role if needed
      let changed = false;
      if (user.provider !== 'google') { user.provider = 'google'; changed = true; }
      if (user.role !== role) { user.role = role; changed = true; }
      if (changed) await this.usersRepo.save(user);
    }

    const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
    const token = this.jwtService.sign(payload);
    return { user, token };
  }
}
