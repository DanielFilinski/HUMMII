import { PartialType } from '@nestjs/swagger';
import { CreateContractorProfileDto } from './create-contractor-profile.dto';

export class UpdateContractorProfileDto extends PartialType(CreateContractorProfileDto) {}

