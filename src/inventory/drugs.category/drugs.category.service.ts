import { Injectable } from '@nestjs/common';
import { CreateDrugsCategoryDto } from './dto/create-drugs.category.dto';
import { UpdateDrugsCategoryDto } from './dto/update-drugs.category.dto';

@Injectable()
export class DrugsCategoryService {
  async create(createDrugsCategoryDto: CreateDrugsCategoryDto) {
    return 'This action adds a new drugsCategory';
  }

  async findAll(/* filters*/) {
    return `This action returns all drugsCategory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} drugsCategory`;
  }

  update(id: number, updateDrugsCategoryDto: UpdateDrugsCategoryDto) {
    return `This action updates a #${id} drugsCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} drugsCategory`;
  }
}
