import { IsDateString, IsInt, IsOptional, IsIn, Min } from 'class-validator';

export class CreateElasticSlotDto {
  @IsDateString({ strict: true })
  date!: string; // YYYY-MM-DD

  @IsOptional()
  @IsIn(['wave', 'stream'])
  mode?: 'wave' | 'stream';

  @IsInt()
  @Min(1)
  slotDuration!: number; // minutes

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsOptional()
  sessionStartTime?: string; // '09:00'
}
