import { ApiProperty } from '@nestjs/swagger';

export class DisputeMessageEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  disputeId: string;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ default: false })
  isInternal: boolean;

  @ApiProperty()
  createdAt: Date;
}

