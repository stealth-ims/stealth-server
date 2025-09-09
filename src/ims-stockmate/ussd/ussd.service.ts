import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateUssdDto } from './dto';
import { StockmateUssdSession } from './models/ussd.model';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../auth/models/user.model';
import { CreateOptions, Op } from 'sequelize';
import { ItemService } from '../../inventory/items/items.service';
import { ItemCategory } from '../../inventory/items-category/models/items-category.model';
import { Patient } from '../../patient/models/patient.model';
import { SalesService } from '../../sales/sales.service';
import { UssdCreateSale } from '../../sales/dto';
import { SalePaymentType } from '../../sales/models/sales.model';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SmsService } from '../../notification/sms/sms.service';
import { BatchService } from '../../inventory/items/batches/batch.service';
import { StockBatchDto } from '../../inventory/items/batches/dto';

@Injectable()
export class StockmateUssdService {
  private logger = new Logger(StockmateUssdService.name);
  constructor(
    @InjectModel(StockmateUssdSession)
    private readonly ussdSessionRepository: typeof StockmateUssdSession,
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(Patient) private patientRepository: typeof Patient,
    private readonly itemsService: ItemService,
    private readonly salesService: SalesService,
    private eventEmitter: EventEmitter2,
    private smsService: SmsService,
    private batchService: BatchService,
  ) {}

  async create(dto: CreateUssdDto) {
    if (dto.text == '') {
      return 'CON Welcome to Zomujo IMS.\nPlease enter your username';
    }

    const ussdSession = await this.ussdSessionRepository.findOne({
      where: { sessionId: dto.sessionId },
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'fullName', 'facilityId', 'departmentId'],
        },
      ],
    });
    const splitText = dto.text.split('*');
    const text = splitText.at(-1);

    if (!ussdSession) {
      const user = await this.userRepository.findOne({
        where: { username: { [Op.iLike]: text } },
        attributes: [
          'id',
          'fullName',
          'username',
          'facilityId',
          'departmentId',
        ],
      });
      if (!user) {
        return 'END Username not found';
      }
      await this.ussdSessionRepository.create({
        sessionId: dto.sessionId,
        createdById: user.id,
      });
      dto.name = user.fullName;
      dto.userId = user.id;
      dto.departmentId = user.departmentId;
      dto.facilityId = user.facilityId;
      return await this.baseInit(dto);
    } else {
      dto.name = ussdSession.createdBy.fullName;
      dto.userId = ussdSession.createdBy.id;
      dto.departmentId = ussdSession.createdBy.departmentId;
      dto.facilityId = ussdSession.createdBy.facilityId;
      return await this.baseInit(dto);
    }
  }

  async createDevTest(dto: CreateUssdDto) {
    return this.baseInit(dto);
  }

  async createDev(dto: CreateUssdDto) {
    if (dto.text == '') {
      return 'CON Welcome to Stealth-IMS.\nPlease enter your username';
    }

    const ussdSession = await this.ussdSessionRepository.findOne({
      where: { sessionId: dto.sessionId },
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'fullName', 'facilityId', 'departmentId'],
        },
      ],
    });
    const splitText = dto.text.split('*');
    const text = splitText.at(-1);

    if (!ussdSession) {
      const user = await this.userRepository.findOne({
        where: { username: { [Op.iLike]: text } },
        attributes: [
          'id',
          'fullName',
          'username',
          'facilityId',
          'departmentId',
        ],
      });
      if (!user) {
        return 'END Username not found';
      }
      await this.ussdSessionRepository.create({
        sessionId: dto.sessionId,
        createdById: user.id,
      });
      dto.name = user.fullName;
      dto.userId = user.id;
      dto.departmentId = user.departmentId;
      dto.facilityId = user.facilityId;
      return await this.baseInit(dto);
    } else {
      dto.name = ussdSession.createdBy.fullName;
      dto.userId = ussdSession.createdBy.id;
      dto.departmentId = ussdSession.createdBy.departmentId;
      dto.facilityId = ussdSession.createdBy.facilityId;
      return await this.baseInit(dto);
    }
  }

  async baseInit(dto: CreateUssdDto) {
    const { text } = dto;
    let response = '';
    console.log(text);
    if (!text.includes('*')) {
      response = `CON Welcome${dto.name ? ' ' + dto.name : ''}!\nWhat would you like to do?\n1. Query a Drug\n2. Dispense Drugs\n3. Stock a drug`;
    }

    const inputs = text.split('*');

    switch (inputs[1]) {
      case '1':
        response = await this.fetchDrug(inputs[1], inputs[2] || null);
        break;

      case '2': {
        const combined = inputs[2] ? inputs.slice(2).join('*') : null;
        response = await this.performSales(inputs[1], combined, dto);
        break;
      }

      case '3': {
        const combined = inputs[2] ? inputs.slice(2).join('*') : null;
        response = await this.stockDrug(inputs[1], combined, dto);
        break;
      }
    }
    return response;
  }

  private extractBatch(str: string) {
    const regexp = /(\w+)[-#](\w+)[-#](\d+)[-#](\d{2}\/\d{2}\/\d{4})/g;
    const array = [...str.matchAll(regexp)];
    const result = array[0];
    const [day, month, year] = result[4].split('/');
    const date = new Date(`${year}-${month}-${day}`);

    return {
      itemCode: result[1],
      batchNumber: result[2],
      quantity: parseInt(result[3]),
      validity: date,
    };
  }

  private async stockDrug(
    mainOption: string,
    subOption: string,
    dto: CreateUssdDto,
  ): Promise<string> {
    if (mainOption === '3' && !subOption) {
      return `CON Enter drug details as:\ncode-batch-quantity-expiry date\n eg ANA004-BATCH123-100-19/07/2027`;
    }
    const inputs = subOption.split('*');
    const body = this.extractBatch(inputs[0]);

    if (!subOption.includes('*')) {
      return `CON Do you want to continue stocking ${body.itemCode}?\n1. Yes\n2. No`;
    }

    const payload: StockBatchDto = {
      ...body,
      createdById: dto.userId,
      departmentId: dto.departmentId,
      facilityId: dto.facilityId,
    };

    switch (inputs[1]) {
      case '1':
        this.eventEmitter.emit('item.stock', {
          data: payload,
          phoneNumber: dto.phoneNumber,
        });
        return `END Drug ${body.itemCode} stocked successfully`;

      case '2':
        return 'END Drug stocking cancelled. Thank you for using our service.';
    }

    return 'END Drug stocked successfully';
  }

  private async performSales(
    mainOption: string,
    subOption: string,
    dto: CreateUssdDto,
  ): Promise<string> {
    try {
      await this.ussdSessionRepository.update(
        { metadata: subOption, updatedById: dto.userId },
        { where: { sessionId: dto.sessionId } },
      );

      if (mainOption === '2' && !subOption) {
        return `CON Enter drug code and quantity (e.g. ACETAZIN1-2).\nFor multiple drugs, separate each with a comma.`;
      }

      if (mainOption === '2' && subOption) {
        if (!subOption.includes('*')) {
          return `CON Choose an option:\n1. Add patient details\n2. Continue sale without patient details\n3. Cancel`;
        }

        const inputs = subOption.split('*');

        switch (inputs[1]) {
          case '1': {
            const combined = inputs[2] ? inputs.slice(2).join('*') : null;
            return this.validatePatient(inputs[1], combined, dto);
            // return 'END Enter patient ID number (Ghana Card, NHIS, or any valid ID)';
          }

          case '2':
            this.eventEmitter.emit('sale.create', {
              sessionId: dto.sessionId,
              phoneNumber: dto.phoneNumber,
            });
            // this.generateSaleQuery(dto.sessionId);
            return 'END An SMS confirmation for your sale will be sent to you shortly.';

          case '3':
            return 'END Sale cancelled. Thank you for using our service.';
        }
      }

      return 'END Sale completed successfully';
    } catch (error) {
      this.logger.error(
        `An error occured: ${error.name} :: ${error.message}`,
        error.stack,
      );
      return 'END An Error Occured';
    }
  }

  private extractNameAndDob(str: string) {
    const regexp = /^([\w\s]+)[-#](\d{2}\/\d{2}\/\d{4})$/gm;
    const array = [...str.matchAll(regexp)];

    const [day, month, year] = array[0][2].split('/');
    const date = new Date(`${year}-${month}-${day}`);

    return { name: array[0][1], dOB: date };
  }

  @OnEvent('item.stock')
  async handleItemsStock(payload: {
    data: StockBatchDto;
    phoneNumber: string;
  }) {
    let respString: string;
    try {
      await this.batchService.stock(payload.data);
      const { itemCode, batchNumber, quantity, validity } = payload.data;
      respString = `Stock update: ${itemCode} (Batch ${batchNumber}) has been stocked with quantity ${quantity}.
      Expiry date: ${new Date(validity).toLocaleDateString('en-GB')}.`;
    } catch (error) {
      if (error instanceof HttpException) {
        respString = `Error: ${error.message}`;
      } else {
        this.logger.error(
          `An error occured: ${error.name} :: ${error.message}`,
          error.stack,
        );
        respString = `An error occurred while stocking ${payload.data.itemCode}. Please try again.`;
      }
    }

    await this.smsService.sendWithAfricasTalking({
      to: payload.phoneNumber,
      body: respString,
    });
  }

  @OnEvent('sale.create')
  async generateSaleQuery(payload: { sessionId: string; phoneNumber: string }) {
    try {
      const { sessionId, phoneNumber } = payload;
      const ussdSession = await this.ussdSessionRepository.findOne({
        where: { sessionId: sessionId },
        include: [
          {
            model: User,
            as: 'createdBy',
            attributes: ['id', 'fullName', 'facilityId', 'departmentId'],
          },
        ],
      });
      const salePayload = this.toObj(ussdSession.metadata);
      salePayload.createdById = ussdSession.createdBy.id;
      salePayload.facilityId = ussdSession.createdBy.facilityId;
      salePayload.departmentId = ussdSession.createdBy.departmentId;
      console.log(salePayload);
      const saleResponse = await this.salesService.ussdSale(salePayload);
      console.log('sales response:', saleResponse);

      const { subTotal, total } = saleResponse.saleMeta;
      const response = saleResponse.responses.join('\n');
      const respString = `Your sale was processed successfully.\n\n${response}\n\nSubtotal: GHS ${subTotal.toFixed(2)}\nNhis Covered: GHS ${(subTotal - total).toFixed(2)}\nTotal Sales Cost: GHS ${total.toFixed(2)}\nThank you for your purchase.`;
      await this.smsService.sendWithAfricasTalking({
        to: phoneNumber,
        body: respString,
      });
      console.log('SMS Message:', respString);
      return salePayload;
    } catch (error) {
      this.logger.error(
        `An error occured: ${error.name} :: ${error.message}`,
        error.stack,
      );
    }
  }

  private toObj(data: string) {
    const saleObj: Record<string, any> = {
      paymentType: [SalePaymentType.CASH],
      insured: true,
    };
    const parts = data.split('*');
    saleObj.saleItems = this.toSaleItems(parts[0]);

    switch (parts[1]) {
      case '2':
        break;
      case '1': {
        saleObj.patientCardId = parts[2];
      }
    }
    return saleObj as UssdCreateSale;
  }

  private toSaleItems(items: string) {
    const regexp = /(\w+)[-#](\d+)/g;
    const array = [...items.matchAll(regexp)];

    const saleItems: { itemCode: string; quantity: number }[] = [];

    for (const item of array) {
      saleItems.push({
        itemCode: item[1],
        quantity: parseInt(item[2]),
      });
    }
    return saleItems;
  }

  private async validatePatient(
    mainOption: string,
    subOption: string,
    dto: CreateUssdDto,
  ) {
    if (mainOption) {
      if (!subOption) {
        return 'CON Enter patient ID number (Ghana Card, NHIS, or any valid ID)';
      }
      const inputs = subOption.split('*');
      const patient = await this.patientRepository.findOne({
        where: { cardIdentificationNumber: { [Op.iLike]: inputs[0] } },
        attributes: ['id', 'cardIdentificationNumber', 'name'],
      });

      if (!patient) {
        if (!subOption.includes('*')) {
          return 'CON Patient not found.\n1. Add new patient\n2. Continue sale without patient details\n3. Cancel';
        }

        if (inputs[1] === '1' && inputs[2]) {
          const { name, dOB } = this.extractNameAndDob(inputs[2]);
          const newPatient = await this.patientRepository.create(
            {
              cardIdentificationNumber: inputs[0],
              dateOfBirth: dOB,
              createdById: dto.userId,
              name,
            },
            { skipAudits: true } as CreateOptions,
          );
          return `CON Sell to ${newPatient.name}?\n1. Yes\n2. No`;
        }

        switch (inputs[1]) {
          case '1':
            return 'CON Enter patient name and DOB\n(e.g. John Agyei-12/05/1990 or John Agyei#12/05/1990)';
          case '2':
            this.eventEmitter.emit('sale.create', {
              sessionId: dto.sessionId,
              phoneNumber: dto.phoneNumber,
            });
            // this.generateSaleQuery(dto.sessionId);
            return 'END An SMS confirmation for your sale will be sent to you shortly.';
          case '3':
            return 'END Sale cancelled. Thank you for using our service.';
        }
      }

      if (!subOption.includes('*')) {
        return `CON Sell to ${patient.name}?\n1. Yes\n2. No`;
      }

      switch (inputs.at(-1)) {
        case '1':
          this.eventEmitter.emit('sale.create', {
            sessionId: dto.sessionId,
            phoneNumber: dto.phoneNumber,
          });
          // this.generateSaleQuery(dto.sessionId);
          return 'END An SMS confirmation for your sale will be sent to you shortly.';
        case '2':
          return 'END Sale cancelled. Thank you for using our service.';
      }
    }
  }

  private async fetchDrug(mainOption: string, subOption?: string) {
    try {
      this.logger.log(
        `Main option: ${mainOption} and Sub Option: ${subOption}`,
      );

      if (mainOption === '1' && !subOption) {
        return 'CON Enter Drug Code (Eg. ACETAZIN1)';
      }

      if (mainOption === '1' && subOption) {
        const item = await this.itemsService.fetchOne({
          query: {
            code: { [Op.iLike]: subOption },
          },
          fields: [
            'id',
            'name',
            'totalStock',
            'brandName',
            'dosageForm',
            'strength',
            'itemFullName',
            'sellingPrice',
          ],
          populate: [{ model: ItemCategory, attributes: ['name'] }],
        });

        if (!item) {
          return `END Drug not found`;
        }

        return `END Item Name: ${item.itemFullName}\nTotal Stock: ${item.totalStock}\nCategory: ${item.category.name}\nSelling Price: GHS${item.sellingPrice}`;
      }
    } catch (error) {
      this.logger.error(
        `An error occured: ${error.name} :: ${error.message}`,
        error.stack,
      );
      return 'END An error occured';
    }
  }
}
