import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListDoctorsDto {
  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  location?: string; // city or region string

  @IsOptional()
  @IsString()
  name?: string; // partial name search

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn(['experience', 'name', 'specialization', 'id', 'createdAt'], { each: false })
  sortBy?: string = 'id';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
