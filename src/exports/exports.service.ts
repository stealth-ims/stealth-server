import { Injectable, Logger } from '@nestjs/common';
import QueryStream from 'pg-query-stream';
import { StreamParser } from '@json2csv/plainjs';
import { Pool } from 'pg';
import { Readable } from 'stream';
import { Json2CSVBaseOptions } from '@json2csv/plainjs/dist/mjs/BaseParser';

@Injectable()
export class ExportsService {
  private logger = new Logger(ExportsService.name);
  private get dbPool() {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  findAll() {
    return `This action returns all exports`;
  }

  async exportStockCsv(
    query: string,
    options?: Json2CSVBaseOptions<object, object>,
  ) {
    const readable = new Readable({
      read() {},
    });
    const client = await this.dbPool.connect();

    try {
      await client.query('BEGIN');

      const queryStream = new QueryStream(query);
      const stream = client.query(queryStream);

      const parser = new StreamParser(options);
      parser.onData = (chunk) => {
        readable.push(chunk);
        // this.logger.log(chunk);
        // this.logger.log('pushed');
      };

      parser.onEnd = () => {
        // this.logger.log('ended parser');
        readable.push(null);
      };

      parser.onError = (err) => {
        readable.destroy(err);
        this.logger.error('JSON2CSV error', err);
        throw err;
      };

      stream.on('data', (chunk) => {
        parser.pushLine(chunk);
      });

      stream.on('end', async () => {
        await client.query('COMMIT;');
        parser.end();
        client.release();
        // this.logger.log('ended stream');
      });

      stream.on('error', async (err) => {
        await client.query('ROLLBACK;');
        client.release();
        this.logger.error('Query Stream Error:', err);
        throw err;
      });

      return readable;
    } catch (err) {
      client.release();
      this.logger.error('Export error:', err);
      throw err;
    }
  }

  findOne(id: string) {
    return `This action returns a #${id} export`;
  }

  // update(id: string, _dto: UpdateExportDto) {
  //   return `This action updates a #${id} export`;
  // }

  remove(id: string) {
    return `This action removes a #${id} export`;
  }
}
