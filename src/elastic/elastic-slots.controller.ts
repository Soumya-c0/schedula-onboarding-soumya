import {
  Controller,
  Post,
  Param,
  Body,
  Get,
  Query,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ElasticSlotsService } from './elastic-slots.service';
import { CreateElasticSlotDto } from './dto/create-elastic-slot.dto';

@Controller('api/v1')
export class ElasticSlotsController {
  constructor(private readonly elasticService: ElasticSlotsService) {}

  // Doctor creates or updates elastic slot config for a specific date
  @Post('doctors/:id/elastic-slots')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async upsert(
    @Param('id', ParseIntPipe) doctorId: number,
    @Body() dto: CreateElasticSlotDto,
  ) {
    return this.elasticService.upsertElasticSlot(doctorId, dto);
  }

  // Get elastic slot info for doctor + date
  // GET /api/v1/doctors/:id/elastic-slots?date=2025-11-30
  @Get('doctors/:id/elastic-slots')
  async getForDate(
    @Param('id', ParseIntPipe) doctorId: number,
    @Query('date') date: string,
  ) {
    return this.elasticService.getSlotsForDoctor(doctorId, date);
  }
}
