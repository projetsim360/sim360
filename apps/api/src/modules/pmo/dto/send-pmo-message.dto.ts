import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendPmoMessageDto {
  @ApiProperty({
    description: 'Message a envoyer au PMO',
    example: 'Quels livrables dois-je produire pour cette phase ?',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  message!: string;
}
