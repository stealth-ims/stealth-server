import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import QueryStream from 'pg-query-stream';
import { StreamParser } from '@json2csv/plainjs';
import { Pool } from 'pg';
import { Readable } from 'stream';
import { Json2CSVBaseOptions } from '@json2csv/plainjs/dist/mjs/BaseParser';
import { LocationQueryDto, PerformanceExportSchema } from './dto';
import PDFDocument from 'pdfkit-table';
import {
  generateGeneralDataQuery,
  generateSaleAndStockingActivityDataQuery,
  generateSystemUsageDataQuery,
  generateTotalQuantityDataQuery,
} from './sql/export-general.sql';
import { generateExportFilename } from 'src/core/shared/factory';
import { format } from 'date-fns';

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

  async exportLocationPerformanceData(query: LocationQueryDto) {
    const doc = new PDFDocument({ margin: 30, size: 'A1' });
    const readable = new Readable({
      read() {},
    });
    const sections = [
      'general',
      'saleAndStockingActivity',
      'systemUsage',
      'totalQuantity',
    ];

    doc
      .font('Helvetica-Bold')
      .fontSize(34)
      .text(`${query.location} REGION USAGE STATS`, {
        align: 'center',
      });

    doc.moveDown(0.5);

    const now = new Date();
    const formattedDate = format(now, 'EEEE, MMMM do, yyyy - hh:mm a');
    doc
      .font('Helvetica')
      .fontSize(18)
      .text(`Generated on: ${formattedDate}`, { align: 'center' });

    doc.moveDown(3.5);

    for (const section of sections) {
      await this.chunkToPdf(query, section, doc);
    }
    doc.end();
    doc.on('data', (chunk) => readable.push(chunk));
    doc.on('end', () => readable.push(null));
    const fileName = generateExportFilename(
      `USAGE_STATS-${query.location}`,
      'pdf',
    );

    return { file: readable, fileName };
  }

  async chunkToPdf(
    query: LocationQueryDto,
    pdfSection: string,
    doc: PDFDocument,
  ) {
    const client = await this.dbPool.connect();
    try {
      let dbQuery = '';
      switch (pdfSection) {
        case 'general':
          dbQuery = generateGeneralDataQuery(query.location);
          break;
        case 'saleAndStockingActivity':
          dbQuery = generateSaleAndStockingActivityDataQuery(query.location);
          break;
        case 'systemUsage':
          dbQuery = generateSystemUsageDataQuery(query.location);
          break;
        case 'totalQuantity':
          dbQuery = generateTotalQuantityDataQuery(query.location);
          break;
        default:
          throw new NotFoundException('Invalid pdfSection');
      }
      const rows = await this.generateTable(dbQuery);
      doc
        .font('Helvetica-Bold')
        .fontSize(24)
        .text(PerformanceExportSchema.sections[pdfSection].title, {
          align: 'center',
        });
      doc.moveDown(0.5);

      await doc.table(
        {
          headers: PerformanceExportSchema.sections[pdfSection].headers,
          datas: rows,
        },
        {
          prepareHeader: () => doc.font('Helvetica-Bold').fontSize(18),
          prepareRow: (_row, _i) => doc.font('Helvetica').fontSize(19),
        },
      );

      if (pdfSection !== 'totalQuantity') {
        doc.moveDown(2.5);
        // doc.addPage();
      }

      // doc.end();
      client.release();
      return doc;
    } catch (error) {
      client.release();
      this.logger.error(`PDFDocument error at section - ${pdfSection}:`, error);
      throw error;
    }
  }

  async generateTable(query: string) {
    const client = await this.dbPool.connect();
    try {
      const queryStream = new QueryStream(query);
      const stream = client.query(queryStream);
      const rows = [];

      for await (const chunk of stream) {
        rows.push(chunk);
      }
      return rows;
    } catch (error) {
      client.release();
      this.logger.error('Query:', query);
      this.logger.error('Table generation error:', error);
      throw error;
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
