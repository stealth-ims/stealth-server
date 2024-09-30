import { Injectable } from '@nestjs/common';
import { CreateDrugOrderDto } from './dto/createOrder.dto';
import { UpdateDrugOrderDto } from './dto/updateOrder.dto';
import { DrugOrder } from './models/drugOrder.model';
import { GetOrdersDto } from './dto/getOrder.dto';

@Injectable()
export class DrugOrdersService {
  // skeleton implementation of service methods to prevent undefined errors in the controller

  public async createDrugOrder(_dto: CreateDrugOrderDto) {
    const res = new DrugOrder();
    return res;
  }

  public async findDrugOrders(_dto: GetOrdersDto) {
    return [new DrugOrder(), new DrugOrder()];
  }

  public async findDrugOrder(_id: string) {
    const res = new DrugOrder();
    return res;
  }

  public async updateDrugOrder(_id: string, _dto: UpdateDrugOrderDto) {
    const res = new DrugOrder();
    return res;
  }

  public async deleteDrugOrder(_id: string) {
    const res = new DrugOrder();
    return res;
  }
}
