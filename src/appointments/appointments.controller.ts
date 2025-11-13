import { Controller, Post, Body, Get, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { SelectTimeDto } from './dto/select-time.dto';

@Controller('api/v1/appointments')
export class AppointmentsController {
  constructor(private readonly apptService: AppointmentsService) {}

  @Post('select-time')
  @UsePipes(new ValidationPipe({ transform: true }))
  async selectTime(@Body() body: SelectTimeDto & { date: string }) {
    return this.apptService.selectTime(body);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.apptService.getAppointmentById(id);
  }
}
