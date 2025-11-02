import { IsEnum, IsArray, ArrayMinSize, ArrayUnique } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

/**
 * DTO for setting user roles (replaces all existing roles)
 * Security: Only ADMIN can set roles
 * @deprecated Use AddUserRoleDto and RemoveUserRoleDto instead
 */
export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'Array of roles for the user',
    enum: UserRole,
    isArray: true,
    example: [UserRole.CLIENT, UserRole.CONTRACTOR],
    enumName: 'UserRole',
  })
  @IsArray({ message: 'Roles must be an array' })
  @ArrayMinSize(1, { message: 'User must have at least one role' })
  @ArrayUnique({ message: 'Roles must be unique' })
  @IsEnum(UserRole, { each: true, message: 'Invalid role in array' })
  roles: UserRole[];
}

