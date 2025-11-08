import { Controller, Post, Get, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { GetProgressDto } from './dto/get-progress.dto';

@Controller('api/v1/onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('update')
  async updateStep(@Body() body: UpdateOnboardingDto) {
    try {
      return await this.onboardingService.updateStep(body.userId, body.step, body.completed);
    } catch (err: any) {
      throw new HttpException(err.message || 'Error updating onboarding', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('progress')
  async getProgress(@Query() query: GetProgressDto) {
    try {
      return await this.onboardingService.getProgress(query.userId);
    } catch (err: any) {
      throw new HttpException(err.message || 'Error fetching progress', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('doctor')
async onboardDoctor(@Body() body: any) {
  try {
    return await this.onboardingService.onboardDoctor(body);
  } catch (err: any) {
    throw new HttpException(err.message || 'Doctor onboarding failed', HttpStatus.BAD_REQUEST);
  }
}

@Post('patient')
async onboardPatient(@Body() body: any) {
  try {
    return await this.onboardingService.onboardPatient(body);
  } catch (err: any) {
    throw new HttpException(err.message || 'Patient onboarding failed', HttpStatus.BAD_REQUEST);
  }
}

}
