import { Controller, Get, Query } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { ListDoctorsDto } from './dto/list-doctors.dto';
import { ValidationPipe, UsePipes } from '@nestjs/common';

@Controller('api/v1/doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async list(@Query() query: ListDoctorsDto) {
    return this.doctorService.list(query);
  }
}
