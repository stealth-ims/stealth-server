import { Injectable, NotFoundException } from '@nestjs/common';
import { Patient } from './models/patient.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreatePatientDto, FindPatientDto, UpdatePatientDto } from './dto';
import { Sale } from '../sales/models/sales.models';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';
import { User } from '../auth/models/user.model';

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(Patient) private patientRepository: typeof Patient,
  ) {}

  async create(dto: CreatePatientDto, createdBy: string) {
    const patient = await this.patientRepository.create({
      ...dto,
      createdById: createdBy,
    });
    return patient;
  }

  async findAll(query: FindPatientDto) {
    const filters = this.applyFilter(query);
    const patients = await this.patientRepository.findAll(filters);
    return patients;
  }

  async findOne(id: string, populate: boolean) {
    const includeOption: Record<string, any> = { include: [] };
    if (populate) {
      includeOption.include = [Sale];
    }
    const patient = await this.patientRepository.findByPk(id, {
      include: [
        ...includeOption.include,
        { model: User, attributes: ['id', 'fullName'], paranoid: false },
      ],
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }

  async findByCardId(id: string, populate: boolean) {
    let includeOption: any = {};
    if (populate) {
      includeOption = { include: [Sale] };
    }
    const patient = await this.patientRepository.findOne({
      where: { cardIdentificationNumber: id },
      ...includeOption,
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }

  async update(id: string, dto: UpdatePatientDto) {
    const updatedPatient = await this.patientRepository.update(dto, {
      where: { id },
    });
    if (updatedPatient[0] == 0) {
      throw new NotFoundException('Patient not found');
    }
    return;
  }

  async remove(id: string, deletedBy: string) {
    await this.patientRepository.update({ deletedBy }, { where: { id } });
    const deletedPatient = await this.patientRepository.destroy({
      where: { id },
    });
    if (deletedPatient == 0) {
      throw new NotFoundException('Patient not found');
    }
    return;
  }

  private applyFilter(query: FindPatientDto): FindAndCountOptions<Patient> {
    const whereOptions: WhereOptions<Patient> = {
      [Op.and]: [
        query.search && {
          [Op.or]: [
            { cardIdentificationNumber: { [Op.iLike]: `%${query.search}%` } },
          ],
        },
      ],
    };
    return {
      where: whereOptions,
      order: [['updatedAt', 'DESC']],
      attributes: ['id', 'name', 'cardIdentificationNumber'],
    };
  }
}
