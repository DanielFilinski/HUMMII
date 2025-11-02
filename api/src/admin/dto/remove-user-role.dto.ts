import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

/**
 * DTO for removing a role from a user
 * Security: Only ADMIN can remove roles
 * Note: User must have at least one role
 */
export class RemoveUserRoleDto {
  @ApiProperty({
    description: 'Role to remove from the user',
    enum: UserRole,
    example: UserRole.CONTRACTOR,
    enumName: 'UserRole',
  })
  @IsEnum(UserRole, { message: 'Invalid role. Must be CLIENT, CONTRACTOR, or ADMIN' })
  @IsNotEmpty()
  role: UserRole;
}

