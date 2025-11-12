import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './doctor.entity';
import { Repository } from 'typeorm';
import { ListDoctorsDto } from './dto/list-doctors.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  async list(dto: ListDoctorsDto) {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 100);
    const qb = this.doctorRepo.createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.user', 'user');

    if (dto.specialization) {
      qb.andWhere('doctor.specialization ILIKE :spec', { spec: `%${dto.specialization}%` });
    }
    if (dto.location) {
      // Assume User has a 'location' column (if not, change accordingly)
      qb.andWhere('user.location ILIKE :loc', { loc: `%${dto.location}%` });
    }
    if (dto.name) {
      qb.andWhere('user.name ILIKE :name', { name: `%${dto.name}%` });
    }

    // sorting
    const orderColumn = dto.sortBy === 'name' ? 'user.name' : `doctor.${dto.sortBy}`;
    qb.orderBy(orderColumn, (dto.sortOrder ?? 'asc').toUpperCase() as 'ASC' | 'DESC');

    // pagination
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}


