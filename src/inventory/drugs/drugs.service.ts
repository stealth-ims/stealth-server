import { Injectable } from '@nestjs/common';
import { CreateDrugDto, UpdateDrugDto } from './dto';

@Injectable()
export class DrugsService {
  create(_createDrugDto: CreateDrugDto) {
    return 'This action adds a new drug';
  }

  findAll() {
    return `This action returns all drugs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} drug`;
  }

  update(id: number, _updateDrugDto: UpdateDrugDto) {
    return `This action updates a #${id} drug`;
  }

  remove(id: number) {
    return `This action removes a #${id} drug`;
  }
}
