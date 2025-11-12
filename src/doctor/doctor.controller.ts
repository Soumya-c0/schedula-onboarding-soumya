import { Controller, Get, Query, Param, HttpException, HttpStatus, UsePipes, ValidationPipe, } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { SlotService } from './slot.service';
import { ListDoctorsDto } from './dto/list-doctors.dto';

@Controller('api/v1/doctors')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly slotService: SlotService,
  ) {}

  // Get list of doctors with optional filters
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async list(@Query() query: ListDoctorsDto) {
    try {
      return await this.doctorService.list(query);
    } catch (err: any) {
      throw new HttpException(err.message || 'Error fetching doctors', HttpStatus.BAD_REQUEST);
    }
  }

  // Get available slots for a specific doctor by date
  @Get(':id/available-slots')
  async getAvailableSlots(@Param('id') id: number, @Query('date') date: string) {
    try {
      return await this.slotService.getAvailableSlots(id, date);
    } catch (err: any) {
      throw new HttpException(err.message || 'Error fetching slots', HttpStatus.BAD_REQUEST);
    }
  }
}
