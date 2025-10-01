import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum PermissionsTypes {
  // Items
  ITEMS_READ = 'items:READ',
  ITEMS_READ_WRITE = 'items:READ_WRITE',
  ITEMS_READ_WRITE_DELETE = 'items:READ_WRITE_DELETE',

  // Item Categories
  ITEM_CATEGORIES_READ = 'item_categories:READ',
  ITEM_CATEGORIES_READ_WRITE = 'item_categories:READ_WRITE',
  ITEM_CATEGORIES_READ_WRITE_DELETE = 'item_categories:READ_WRITE_DELETE',

  // Stock Adjustment
  STOCK_ADJUSTMENT_READ = 'stock_adjustment:READ',
  STOCK_ADJUSTMENT_READ_WRITE = 'stock_adjustment:READ_WRITE',
  STOCK_ADJUSTMENT_READ_WRITE_DELETE = 'stock_adjustment:READ_WRITE_DELETE',

  // Item Orders
  ITEM_ORDERS_READ = 'item_orders:READ',
  ITEM_ORDERS_READ_WRITE = 'item_orders:READ_WRITE',
  ITEM_ORDERS_READ_WRITE_DELETE = 'item_orders:READ_WRITE_DELETE',

  // Reports
  REPORTS_READ = 'reports:READ',
  REPORTS_READ_WRITE = 'reports:READ_WRITE',
  REPORTS_READ_WRITE_DELETE = 'reports:READ_WRITE_DELETE',

  // Suppliers
  SUPPLIERS_READ = 'suppliers:READ',
  SUPPLIERS_READ_WRITE = 'suppliers:READ_WRITE',
  SUPPLIERS_READ_WRITE_DELETE = 'suppliers:READ_WRITE_DELETE',

  // Sales
  SALES_READ = 'sales:READ',
  SALES_READ_WRITE = 'sales:READ_WRITE',
  SALES_READ_WRITE_DELETE = 'sales:READ_WRITE_DELETE',

  // Department Requests
  DEPARTMENT_REQUESTS_READ = 'department_requests:READ',
  DEPARTMENT_REQUESTS_READ_WRITE = 'department_requests:READ_WRITE',
  DEPARTMENT_REQUESTS_READ_WRITE_DELETE = 'department_requests:READ_WRITE_DELETE',

  // Departments
  DEPARTMENTS_READ = 'departments:READ',
  DEPARTMENTS_READ_WRITE = 'departments:READ_WRITE',
  DEPARTMENTS_READ_WRITE_DELETE = 'departments:READ_WRITE_DELETE',

  // Users
  USERS_READ = 'users:READ',
  USERS_READ_WRITE = 'users:READ_WRITE',
  USERS_READ_WRITE_DELETE = 'users:READ_WRITE_DELETE',
}

export class ChangeRoleDto {
  @ApiPropertyOptional({
    example: 'ef7f6868-ffb1-4de1-8ac1-5208f11b09be',
    description: 'The ID of the department to assign the user to',
  })
  @IsOptional()
  @IsUUID(4)
  departmentId: string;

  @ApiPropertyOptional({
    example: 'Healthcare Worker',
    description: 'changing user role to something else',
  })
  @IsOptional()
  @IsString()
  role: string;

  @ApiPropertyOptional({
    example: [
      'items:READ',
      'item_categories:READ_WRITE',
      'stock_adjustment:READ_WRITE_DELETE',
      'item_orders:READ_WRITE_DELETE',
    ],
    description: 'The permissions assigned to a user',
    enum: PermissionsTypes,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(PermissionsTypes, { each: true })
  permissions: PermissionsTypes[];
}
