import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

const numericTransformer = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};

@Entity({ name: 'accounts' })
export class AccountEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id!: string;

  @Column({ name: 'client_id', type: 'varchar', length: 36 })
  clientId!: string;

  @Column({ type: 'varchar', length: 3 })
  currency!: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, transformer: numericTransformer })
  balance!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
