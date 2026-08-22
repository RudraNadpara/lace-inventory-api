import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('StockLedger')
export class StockLedger {
  @PrimaryGeneratedColumn()
  TransactionID: number;

  @Column({ type: 'varchar', length: 100 })
  Barcode: string;

  @Column({ type: 'varchar', length: 50 })
  Color: string;

  @Column({ type: 'varchar', length: 10 })
  TransactionType: string;

  @Column({ type: 'int' })
  Quantity: number;

  @CreateDateColumn()
  TxDate: Date;
}