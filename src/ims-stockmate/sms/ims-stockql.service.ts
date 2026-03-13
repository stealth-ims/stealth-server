import { Injectable } from '@nestjs/common';
import {
  ExpireType,
  IMSQLAction,
  ParsedImsStockQlCommand,
  SellActionOptions,
} from './dto';
import { SalePaymentType } from '../../sales/models/sales.model';

@Injectable()
export class ImsStockQlService {
  private normalizeInput(input: string): string {
    return input.trim().replace(/\s+/g, ' ').toUpperCase();
  }
  private stripQuotes(str: string): string {
    return str
      .replace(/^['"](.*)['"]$/, '$1')
      .trim()
      .toLowerCase();
  }

  private levenshtein(a: string, b: string): number {
    const dp = Array.from({ length: a.length + 1 }, () =>
      Array(b.length + 1).fill(0),
    );
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }
    return dp[a.length][b.length];
  }

  private fuzzyMatch(
    word: string,
    options: string[],
    maxDistance = 1,
  ): string | null {
    for (const option of options) {
      if (this.levenshtein(word, option) <= maxDistance) return option;
    }
    return null;
  }

  parse(input: string): ParsedImsStockQlCommand[] {
    const original = input.trim();
    const segments = original
      .split(/;|\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const results: ParsedImsStockQlCommand[] = [];

    for (const seg of segments) {
      const cmd = this.normalizeInput(seg);
      const parts = cmd.split(' ');
      const actions = ['STOCK', 'ADD', 'QUERY', 'SHOW', 'LIST', 'SELL'];
      const action = this.fuzzyMatch(parts[0], actions);
      if (!action) {
        results.push({
          action: 'UNKNOWN',
          errorOptions: {
            action: 'UNKNOWN',
            error: `Unknown command: "${seg}"`,
          },
        });
        continue;
      }

      if (['STOCK', 'ADD'].includes(action)) {
        const stockMatch = cmd.match(
          /^STOCK "?(.+?)"? (?:INTO|TO) "?(.+?)"? (?:WITH|QUANTITY) (\d+)\s*(?:EXPIRES)*\s*"?(.*?)"?$/,
        );
        // console.log(cmd, stockMatch);

        const nlStock = cmd.match(/^ADD (\d+) "?(.+?)"? TO "?(.+?)"?$/);
        if (stockMatch) {
          results.push({
            action: 'STOCK',
            stockOptions: {
              action: 'STOCK',
              item: this.stripQuotes(stockMatch[1].toLowerCase()),
              batch: this.stripQuotes(stockMatch[2].toLowerCase()),
              quantity: parseInt(stockMatch[3], 10),
              expiresAt: stockMatch[4] ? new Date(stockMatch[4]) : null,
            },
          });
          continue;
        }
        if (nlStock) {
          results.push({
            action: 'STOCK',
            stockOptions: {
              action: 'STOCK',
              item: this.stripQuotes(nlStock[2].toLowerCase()),
              batch: this.stripQuotes(nlStock[3].toLowerCase()),
              quantity: parseInt(nlStock[1], 10),
              expiresAt: null,
            },
          });
          continue;
        }
      }

      if (['QUERY', 'SHOW'].includes(action)) {
        const queryMatch = cmd.match(/^(QUERY|SHOW) "?(.+?)"?$/i);
        if (queryMatch) {
          results.push({
            action: 'QUERY',
            queryOptions: {
              action: 'QUERY',
              item: this.stripQuotes(queryMatch[2].toLowerCase()),
            },
          });
          continue;
        }
      }

      if (['LIST'].includes(action)) {
        const listItemsMatch = cmd.match(
          /^LIST ITEMS\s*"?(.*?)"?\s*(EXPIRE[SD])*\s*(\d+)?$/,
        );
        // console.log(cmd, listItemsMatch);
        if (listItemsMatch) {
          results.push({
            action: 'LIST',
            listOptions: {
              action: 'LIST',
              listType: 'ITEMS',
              item: this.stripQuotes(listItemsMatch[1].toLowerCase()) ?? null,
              expireType: listItemsMatch[2]
                ? (this.stripQuotes(listItemsMatch[2]) as ExpireType)
                : null,
              days: listItemsMatch[3] ? +listItemsMatch[3] : null,
            },
          });
          continue;
        }

        const listPatientsMatch = cmd.match(
          /^LIST\s+PATIENTS\s*(?:["']?(.*?)["']?)?$/,
        );
        // console.log(cmd, listPatientsMatch);
        if (listPatientsMatch) {
          results.push({
            action: 'LIST',
            listOptions: {
              action: 'LIST',
              listType: 'PATIENTS',
              patientQuery: listPatientsMatch[1]
                ? this.stripQuotes(listPatientsMatch[1].toLowerCase())
                : null,
            },
          });
          continue;
        }

        const listBatchMatch = cmd.match(/^LIST BATCHES FOR "?(.+?)"?$/);
        const nlListBatch = cmd.match(/^(SHOW|LIST) BATCHES FOR "?(.+?)"?$/);
        if (listBatchMatch || nlListBatch) {
          const item = (
            listBatchMatch?.[1] ||
            nlListBatch?.[2] ||
            ''
          ).toLowerCase();
          results.push({
            action: 'LIST',
            listOptions: {
              action: 'LIST',
              listType: 'BATCHES',
              item: this.stripQuotes(item),
            },
          });
          continue;
        }
      }

      if (['SELL'].includes(action)) {
        const sellItemsMatch = cmd.match(
          /^SELL\s*(TO\s*"?.*?"?)*\s*(USING\s*"?.*?"?)*\s*(?:WITH\s*ITEMS|AND\s*ITEMS|SELL\s*ITEMS|ITEMS)\s*(.*)$/,
        );
        // console.log(cmd, sellItemsMatch);

        if (sellItemsMatch && sellItemsMatch.length > 1) {
          const [_, ...remainder] = sellItemsMatch;
          const sellActionOptions = this.parseAndSerialize(remainder);
          // console.log('sell action options', sellActionOptions);
          results.push({
            action: 'SELL',
            sellOptions: {
              ...sellActionOptions,
            },
          });
        }
      }

      if (!actions.includes(action)) {
        results.push({
          action: action as IMSQLAction,
          errorOptions: {
            action: action as IMSQLAction,
            error: `Could not understand: "${seg}"`,
          },
        });
      }
    }

    return results;
  }

  parseAndSerialize(salesQuery: string[] | RegExpMatchArray) {
    const salesAction: SellActionOptions = {
      action: 'SELL',
      saleItems: [],
      patientCardId: null,
      paymentType: null,
    };

    const parseItemsString = (input: string) => {
      const regex = /\(([^,]+),\s*(\d+)\)/g;
      const result = [];
      let match: RegExpExecArray;

      while ((match = regex.exec(input)) !== null) {
        result.push({
          batchNumber: match[1],
          quantity: Number(match[2]),
        });
      }
      if (result.length > 0) {
        salesAction.saleItems = result;
      }
      return;
    };

    const parsePatientString = (input: string) => {
      if (input) {
        const match = input.match(/^TO\s*["']?(.*?)["']?$/);
        if (match && match.length > 1) {
          salesAction.patientCardId = match[1];
        }
        return;
      }
    };

    const parsePaymentString = (input: string) => {
      if (input) {
        const match = input.match(/USING\s*["']?(.+?)["']?$/);
        if (match && match.length > 1) {
          salesAction.paymentType = [
            match[1].toUpperCase(),
          ] as SalePaymentType[];
        }
        return;
      }
    };

    for (const query of salesQuery) {
      parsePatientString(query);
      parsePaymentString(query);
      parseItemsString(query);
    }
    return salesAction;
  }
}
