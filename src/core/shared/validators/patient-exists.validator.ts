import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PatientService } from '../../../patient/patient.service';

@ValidatorConstraint({ name: 'PatientExists', async: true })
@Injectable()
export class PatientExistsRule implements ValidatorConstraintInterface {
  constructor(private patientService: PatientService) {}
  async validate(value: any, args?: ValidationArguments) {
    try {
      if (!value) {
        return true;
      }
      const patient = await this.patientService.findOne(value, false);
      (args.object as any)[args.property] = patient.id;
    } catch (_e) {
      return false;
    }
    return true;
  }

  defaultMessage(_validationArguments?: ValidationArguments): string {
    return 'Patient does not exist';
  }
}

export function PatientExists(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'PatientExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: PatientExistsRule,
    });
  };
}
