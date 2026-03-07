import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadCvDto {
  @ApiProperty({
    description: 'URL du fichier CV uploade via StorageModule',
    example: 'https://storage.example.com/cvs/user123.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileUrl!: string;
}
