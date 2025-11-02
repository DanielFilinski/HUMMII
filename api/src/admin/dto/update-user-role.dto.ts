import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'New role for the user',
    enum: UserRole,
    example: UserRole.CONTRACTOR,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}

