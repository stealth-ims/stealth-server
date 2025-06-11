export type IMSQLAction = 'STOCK' | 'QUERY' | 'LIST';
export type IMSQLListType = 'ITEMS' | 'BATCHES';
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
}
export interface StockActionOptions extends ActionOptions {
  expiresAt?: Date;
}
export interface ErrorOptions {
  action: IMSQLAction;
  error?: string;
}
export interface ParsedImsStockQlCommand {
  action: IMSQLAction;
  stockOptions?: StockActionOptions;
  queryOptions?: ActionOptions;
  listOptions?: ListActionOptions;
  errorOptions?: ErrorOptions;
}
