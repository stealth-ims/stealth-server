import { ApiResponseProperty, PickType } from '@nestjs/swagger';
import { CreateUserDto } from '../../user/dto';
import { Department } from '../department/models/department.model';

export class GetAdminUserDto extends PickType(CreateUserDto, [
  'fullName',
  'role',
  'status',
]) {
  @ApiResponseProperty({
    example: {
      id: '44220956-0962-4dd0-9e65-1564c585563c',
      name: 'Department A',
    },
  })
  department: Department;
}
