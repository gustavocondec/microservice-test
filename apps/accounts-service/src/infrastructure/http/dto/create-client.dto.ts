import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({
    example: 'Ada Lovelace',
    description: 'Nombre completo del cliente',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    example: 'ada@example.com',
    description: 'Correo electrónico único del cliente',
  })
  @IsEmail()
  @MaxLength(180)
  email!: string;
}
