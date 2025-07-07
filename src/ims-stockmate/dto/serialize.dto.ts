import { SalePaymentType } from '../../sales/models/sales.model';

export type IMSQLAction = 'STOCK' | 'QUERY' | 'LIST' | 'SELL' | 'UNKNOWN';
export type IMSQLListType = 'ITEMS' | 'BATCHES' | 'PATIENTS';
export type ExpireType = 'EXPIRES' | 'EXPIRED';

export interface ActionOptions {
  action: IMSQLAction;
  item?: string;
  batch?: string;
  quantity?: number;
  listType?: IMSQLListType;
}

export interface ListActionOptions extends ActionOptions {
  expireType?: ExpireType;
  days?: number;
  patientQuery?: string;
}
export interface StockActionOptions extends ActionOptions {
  expiresAt?: Date;
}
export interface ErrorOptions {
  action: IMSQLAction;
  error?: string;
}
export interface SellActionOptions {
  action: IMSQLAction;
  patientCardId?: string;
  paymentType?: SalePaymentType[];
  saleItems: { batchNumber: string; quantity: number; itemId?: string }[];
}
export interface ParsedImsStockQlCommand {
  action: IMSQLAction;
  stockOptions?: StockActionOptions;
  queryOptions?: ActionOptions;
  listOptions?: ListActionOptions;
  sellOptions?: SellActionOptions;
  errorOptions?: ErrorOptions;
}
