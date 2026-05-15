import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateIf } from 'class-validator';
import { TransactionType } from '@app/contracts';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.TRANSFER,
    description: 'Tipo de transacción',
  })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({
    example: 40,
    description: 'Monto de la transacción',
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({
    example: '1094ea9a-7f22-4d0e-8d6b-d8f69ef0bd0c',
    description: 'Cuenta origen para retiros o transferencias',
  })
  @ValidateIf(
    (o: CreateTransactionDto) =>
      o.type === TransactionType.WITHDRAW || o.type === TransactionType.TRANSFER,
  )
  @IsUUID()
  sourceAccountId?: string;

  @ApiPropertyOptional({
    example: 'e9055df1-325c-4ce1-b8fb-c835f0927e8a',
    description: 'Cuenta destino para depósitos o transferencias',
  })
  @ValidateIf(
    (o: CreateTransactionDto) =>
      o.type === TransactionType.DEPOSIT || o.type === TransactionType.TRANSFER,
  )
  @IsUUID()
  targetAccountId?: string;

  @ApiProperty({
    example: 'transfer-001',
    description: 'Clave idempotente única por solicitud',
  })
  @IsString()
  idempotencyKey!: string;

  @ApiPropertyOptional({
    example: 'corr-transfer-001',
    description: 'Identificador de correlación opcional',
  })
  @IsOptional()
  @IsString()
  correlationId?: string;
}
