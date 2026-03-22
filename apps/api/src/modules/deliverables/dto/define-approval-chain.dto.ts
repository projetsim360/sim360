import { IsArray, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ApprovalChainEntryDto {
  @ApiProperty({
    description: 'Role du reviewer (SPONSOR, CLIENT, TECHNICAL_LEAD)',
  })
  @IsString()
  role!: string;

  @ApiProperty({ description: "ID du membre d'equipe reviewer" })
  @IsString()
  memberId!: string;
}

export class DefineApprovalChainDto {
  @ApiProperty({
    type: [ApprovalChainEntryDto],
    description: "Chaine d'approbation",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalChainEntryDto)
  chain!: ApprovalChainEntryDto[];
}
