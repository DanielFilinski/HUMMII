import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderType, OrderStatus } from '@prisma/client';

export class OrderEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ enum: OrderType })
  type: OrderType;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  clientId: string;

  @ApiPropertyOptional()
  contractorId?: string;

  @ApiPropertyOptional()
  latitude?: number;

  @ApiPropertyOptional()
  longitude?: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  province: string;

  @ApiProperty()
  postalCode: string;

  @ApiPropertyOptional()
  budget?: number;

  @ApiPropertyOptional()
  agreedPrice?: number;

  @ApiPropertyOptional()
  deadline?: Date;

  @ApiPropertyOptional()
  publishedAt?: Date;

  @ApiPropertyOptional()
  startedAt?: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt?: Date;
}

