import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

/**
 * DTO for adding a role to a user
 * Security: Only ADMIN can add roles
 */
export class AddUserRoleDto {
  @ApiProperty({
    description: 'Role to add to the user',
    enum: UserRole,
    example: UserRole.CONTRACTOR,
    enumName: 'UserRole',
  })
  @IsEnum(UserRole, { message: 'Invalid role. Must be CLIENT, CONTRACTOR, or ADMIN' })
  @IsNotEmpty()
  role: UserRole;
}
