import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './user/user.entity';
import { Doctor } from './doctor/doctor.entity';
import { Patient } from './patient/patient.entity';
import { AuthModule } from './auth/auth.module';
import { VerificationModule } from './verification/verification.module';
import { VerificationToken } from './verification/verification.entity';
import { VerificationService } from './verification/verification.service';
import { VerificationController } from './verification/verification.controller';
import * as dotenv from 'dotenv';

dotenv.config();

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
      entities: [__dirname + '/**/*.entity{.ts,.js}'], 
      synchronize: true,
      logging:true, // auto-create tables (for dev only)
    }),
    AuthModule,
    VerificationModule,
    TypeOrmModule.forFeature([User, Doctor, Patient, VerificationToken]),
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
})
export class AppModule {}
