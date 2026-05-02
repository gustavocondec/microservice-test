import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    example: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
    description: 'UUID del cliente dueño de la cuenta',
  })
  @IsString()
  @Length(36, 36)
  clientId!: string;

  @ApiProperty({
    example: 'USD',
    description: 'Moneda de la cuenta',
    minLength: 3,
    maxLength: 3,
  })
  @IsString()
  @Length(3, 3)
  currency!: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Saldo inicial de la cuenta',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialBalance = 0;
}
