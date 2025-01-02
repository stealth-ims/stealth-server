import { Injectable, NotFoundException } from '@nestjs/common';
import { Patient } from './models/patient.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreatePatientDto, FindPatientDto, UpdatePatientDto } from './dto';
import { Sale } from '../sales/models/sales.models';
import { FindAndCountOptions, Op, WhereOptions } from 'sequelize';

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(Patient) private patientRepository: typeof Patient,
  ) {}

  async create(dto: CreatePatientDto, createdBy: string) {
    const patient = await this.patientRepository.create({ ...dto, createdBy });
    return patient;
  }

  async findAll(query: FindPatientDto) {
    const filters = this.applyFilter(query);
    const patients = await this.patientRepository.findAll(filters);
    return patients;
  }

  async findOne(id: string) {
    const patient = await this.patientRepository.findByPk(id, {
      include: [Sale],
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
