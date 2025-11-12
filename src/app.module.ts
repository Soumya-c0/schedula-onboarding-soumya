import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './user/user.entity';
import { Doctor } from './doctor/doctor.entity';
import { Patient } from './patient/patient.entity';
import { AuthModule } from './auth/auth.module';
import { VerificationModule } from './verification/verification.module';
import { VerificationToken } from './verification/verification.entity';
import { DoctorModule } from './doctor/doctor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Doctor, Patient, VerificationToken],
      synchronize: true,
      logging:true, // auto-create tables (for dev only)
    }),
    AuthModule,
    VerificationModule,
    DoctorModule,
    TypeOrmModule.forFeature([User, Doctor, Patient]),
  ],
})
export class AppModule {}
