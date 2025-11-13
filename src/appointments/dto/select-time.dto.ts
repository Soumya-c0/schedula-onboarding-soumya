import { IsUUID, IsOptional, IsString, Matches } from 'class-validator';

export class SelectTimeDto {
  @IsUUID()
  doctorId!: string;

  @IsUUID()
  userId!: string; // patient user id

  @IsOptional()
  @IsString()
  // expected HH:mm format for wave bookings (server converts to date)
  @Matches(/^\d{2}:\d{2}$/, { message: 'slotTime must be HH:mm' })
  slotTime?: string;
}
