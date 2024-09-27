import { Injectable } from '@nestjs/common';
import { CreateDrugsCategoryDto, UpdateDrugsCategoryDto } from './dto';

@Injectable()
export class DrugsCategoryService {
  async create(_createDrugsCategoryDto: CreateDrugsCategoryDto) {
    return 'This action adds a new drugsCategory';
  }

  async findAll(/* filters*/) {
    return `This action returns all drugsCategory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} drugsCategory`;
  }

  //@Kratosgado:: when ready to use the the dto omit the underscore
  update(id: number, _updateDrugsCategoryDto: UpdateDrugsCategoryDto) {
    return `This action updates a #${id} drugsCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} drugsCategory`;
  }
}
