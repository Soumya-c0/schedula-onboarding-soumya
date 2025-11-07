import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { SendVerificationDto } from './dto/send-verification.dto';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';

@Controller('api/v1/verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('send')
  async send(@Body() body: SendVerificationDto) {
    try {
      return await this.verificationService.sendVerification(body.userId, body.method || 'email');
    } catch (err:any) {
      throw new HttpException(err.message || 'Error', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('confirm')
  async confirm(@Body() body: ConfirmVerificationDto) {
    try {
      return await this.verificationService.confirmOtp(body.userId, body.otp);
    } catch (err:any) {
      throw new HttpException(err.message || 'Error', HttpStatus.BAD_REQUEST);
    }
  }
}
