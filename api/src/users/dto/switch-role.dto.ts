import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class SwitchRoleDto {
  @ApiProperty({
    description: 'Role to switch to',
    example: 'CONTRACTOR',
    enum: UserRole,
  })
  @IsEnum(UserRole, { message: 'Role must be either CLIENT or CONTRACTOR' })
  role: UserRole;
}

