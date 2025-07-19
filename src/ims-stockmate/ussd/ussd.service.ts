import { Injectable } from '@nestjs/common';
import { CreateUssdDto } from './dto';

@Injectable()
export class StockmateUssdService {
  async create(dto: CreateUssdDto) {
    return this.baseInit(dto.text);
  }

  async createDevTest(dto: CreateUssdDto) {
    return this.baseInit(dto.text);
  }

  async createDev(dto: CreateUssdDto) {
    return this.baseInit(dto.text);
  }

  async baseInit(text: string) {
    let response = '';

    if (text == '') {
      response = `CON What would you like to check?\n1. My account\n2. My phone number`;
    } else if (text == '1') {
      response = `CON Choose account information you want to view
      1. Account number`;
    } else if (text == '2') {
      response = `END Your phone number is ${text}`;
    } else if (text == '1*1') {
      const accountNumber = 'ACC100101';

      response = `END Your account number is ${accountNumber}`;
    }
    return response;
  }
}
