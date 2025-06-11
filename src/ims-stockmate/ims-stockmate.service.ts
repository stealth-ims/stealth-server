import { Injectable } from '@nestjs/common';
import { ParsedImsStockQlCommand, TwilioWebhookDto } from './dto';
import { ItemService } from '../inventory/items/items.service';
import * as yaml from 'js-yaml';
import { addDays, format, startOfToday } from 'date-fns';
import { UserService } from '../user/user.service';
import { ImsStockQlService } from './ims-stockql.service';
import { Op } from 'sequelize';
import { ItemCategory } from '../inventory/items-category/models/items-category.model';
import { Batch } from '../inventory/items/models';
import { BatchService } from '../inventory/items/batches/batch.service';

@Injectable()
export class ImsStockmateService {
  constructor(
    private itemService: ItemService,
    private batchService: BatchService,
    private userService: UserService,
    private imsStockQlService: ImsStockQlService,
  ) {}

  async create(dto: TwilioWebhookDto) {
    const regex = /\+\d*/;
    dto.from = dto.from.match(regex)[0];
    const user = await this.userService.fetchOne({
      query: {
        phoneNumber: dto.from,
      },
      fields: ['id', 'facilityId', 'departmentId'],
    });
    const ownershipQuery = {
      facilityId: user.facilityId,
      departmentId: user.departmentId,
    };
    // const serializedBody = new IMSQuery(dto.body);
    const parsedCommands = this.imsStockQlService.parse(dto.body);

    const responses = await Promise.all(
      parsedCommands.map((cmd) =>
        this.handleParsedCommand(cmd, ownershipQuery, user.id),
      ),
    );

    const serializedOutput = yaml.dump({ responses });
    return serializedOutput;
  }

  async handleParsedCommand(
    command: ParsedImsStockQlCommand,
    ownershipQuery: Record<string, any>,
    userId: string,
  ): Promise<any> {
    if (command.errorOptions && command.errorOptions.error)
      return {
        action: command.errorOptions.action,
        message: `❌ ${command.errorOptions.error}`,
      };

    switch (command.action) {
      default:
        return { message: '🤖 Unknown action' };

      case 'STOCK': {
        const cmd = command.stockOptions;
        console.log('expiry date', cmd.expiresAt);
        const batch = await this.batchService.stock({
          itemName: cmd.item,
          batchNumber: cmd.batch,
          quantity: cmd.quantity,
          ...(cmd.expiresAt && { validity: cmd.expiresAt }),
          createdById: userId,
          facilityId: ownershipQuery.facilityId,
          departmentId: ownershipQuery.departmentId,
        });
        return {
          batch: batch.get({ plain: true }),
          message: `✅ Stocked ${cmd.quantity} ${cmd.item}(s) to batch ${cmd.batch}`,
        };
      }

      case 'QUERY': {
        const cmd = command.queryOptions;
        const item = await this.itemService.fetchOne({
          query: {
            name: { [Op.iLike]: `%${cmd.item}%` },
            ...ownershipQuery,
          },
          fields: ['name', 'totalQuantity'],
          populate: [
            {
              model: Batch,
              attributes: ['batchNumber', 'quantity', 'validity'],
            },
            { model: ItemCategory, attributes: ['name'] },
          ],
        });
        const itemJson = item.toJSON();
        const formatedBatches = itemJson.batches.map((batch: any) => {
          batch.expiresAt = format(batch.validity, 'EEEE, MMMM do, yyyy');
          delete batch.validity;
          return batch;
        });
        itemJson.batches = formatedBatches;
        return itemJson;
      }

      case 'LIST': {
        const cmd = command.listOptions;
        const whereOptions: Record<string, any> = {};
        if (cmd.listType === 'ITEMS') {
          const searchOptions: Record<string, any> = {};
          if (cmd.item) {
            searchOptions.search = cmd.item;
            searchOptions.searchFields = ['name'];
          }
          if (cmd.expireType) {
            if (cmd.expireType.toUpperCase() === 'EXPIRES' && cmd.days) {
              const today = startOfToday();
              const daysFromNow = addDays(today, cmd.days);
              whereOptions.validity = {
                [Op.between]: [today, daysFromNow],
              };
            } else if (cmd.expireType.toUpperCase() === 'EXPIRED') {
              const today = startOfToday();
              whereOptions.validity = {
                [Op.lt]: today,
              };
            }
            searchOptions.populate = [
              {
                model: Batch,
                attributes: ['batchNumber', 'quantity', 'validity'],
                where: {
                  ...whereOptions,
                },
                order: [['validity', 'ASC']],
              },
            ];
          }
          const items = await this.itemService.fetchAndCountAll({
            query: {
              ...ownershipQuery,
            },
            ...searchOptions,
            fields: ['name'],
            sort: 'name',
          });
          const itemsJson = {
            count: items.count,
            rows: items.rows.map((row) => row.toJSON()),
          };
          return itemsJson;
        }
        if (cmd.listType === 'BATCHES') {
          const searchOptions: Record<string, any> = {};
          if (cmd.item) {
            searchOptions.search = cmd.item;
            searchOptions.searchFields = ['name'];
          }
          const items = await this.itemService.fetchAndCountAll({
            query: {
              ...ownershipQuery,
            },
            ...searchOptions,
            fields: ['name'],
            sort: 'name',
          });
          const itemsJson = {
            count: items.count,
            rows: items.rows.map((row) => row.toJSON()),
          };
          return itemsJson;
        }
      }
    }

    return { message: '🤖 Unknown action' };
  }

  findAll() {
    return `This action returns all imsStockmate`;
  }

  findOne(id: number) {
    return `This action returns a #${id} imsStockmate`;
  }
}
