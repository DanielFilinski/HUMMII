import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'New order status',
    enum: OrderStatus,
    example: OrderStatus.PUBLISHED,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

