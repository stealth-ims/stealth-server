import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindAndCountOptions, Op } from 'sequelize';
import { Department } from './models/department.model';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';
import { PaginationRequestDto } from '../../shared/docs/dto/pagination.dto';
import { NotificationService } from '../../notification/notification.service';
import { User } from '../../auth/models/user.model';

@Injectable()
export class DepartmentService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(Department)
    private readonly departmentRepo: typeof Department,
    @InjectModel(User)
    private readonly userRepo: typeof User,
    private readonly notificationService: NotificationService,
  ) {
    this.logger = new Logger(DepartmentService.name);
  }

  /**
   * Creates a new department.
   *
   * @param createDepartmentDto - The DTO containing the data for creating a department.
   * @returns A promise that resolves to the created department.
   * @throws {BadRequestException} If there is a unique constraint error.
   * @throws {InternalServerErrorException} If there is an internal server error.
   */
  async create(
    createDepartmentDto: CreateDepartmentDto,
    facilityId: string,
    adminId: string,
  ): Promise<Department> {
    const user = await this.userRepo.findByPk(adminId, {
      attributes: ['id', 'fullName'],
    });

    const department = await this.departmentRepo.create({
      ...createDepartmentDto,
      facilityId,
      createdBy: user,
    });
    this.notificationService.notifyAdmin({
      message: 'Department has been created successfully',
      url: 'https://ims-frontend-xi.vercel.app/suppliers',
    });
    return department;
  }

  /**
   * Retrieves all departments.
   *
   * @param limit - The maximum number of categories to retrieve.
   * @returns A promise that resolves to an array of DepartmentResponse objects.
   * @throws {InternalServerErrorException} if an error occurs while retrieving the categories.
   */
  async findAll(query: PaginationRequestDto, facilityId: string) {
    const searchByName =
      (query.search && { name: { [Op.iLike]: `%${query.search}%` } }) || {};
    const filter: FindAndCountOptions<Department> = {
      where: {
        facilityId,
        ...searchByName,
      },
      limit: query.pageSize || 10,
      offset: query.pageSize * (query.page - 1) || 0,
      order: query.orderBy && [[query.orderBy, 'ASC']],
    };
    const { rows, count } = await this.departmentRepo.findAndCountAll(filter);

    return { rows, count };
  }

  /**
   * Finds a department by its ID.
   *
   * @param id - The ID of the department to find.
   * @returns A promise that resolves to the found department.
   * @throws {NotFoundException} If the department with the given ID is not found.
   * @throws {InternalServerErrorException} If an internal server error occurs.
   */
  async findOne(id: string) {
    this.logger.log(`Finding department by ID`);
    const department = await this.departmentRepo.findByPk(id, {
      include: [{ all: true }],
    });

    if (!department) {
      throw new NotFoundException(`Department with id: ${id} not found`);
    }
    return department;
  }

  /**
   * Updates a department.
   *
   * @param id - The ID of the department.
   * @param updateDepartmentDto - The DTO containing the updated department data.
   * @returns A Promise that resolves to the updated department.
   * @throws InternalServerErrorException if an error occurs during the update process.
   */
  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
    adminId: string,
  ) {
    this.logger.log(`Updating department`);
    const result = await this.departmentRepo.update(
      { ...updateDepartmentDto, updatedBy: adminId },
      { where: { id } },
    );
    const affected = result[0];
    if (affected == 0) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }
    return;
  }

  /**
   * Removes a department by its ID.
   *
   * @param id - The ID of the department to remove.
   * @returns A promise that resolves to the result of the removal operation.
   * @throws {InternalServerErrorException} If an error occurs during the removal operation.
   */
  async remove(id: string) {
    this.logger.log(`Removing department with ID: ${id}`);
    const res = await this.departmentRepo.destroy({ where: { id: id } });

    if (res == 0) {
      throw new NotFoundException(`Department with id ${id} not found`);
    }
  }
}
