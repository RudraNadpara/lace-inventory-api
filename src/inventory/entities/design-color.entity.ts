import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('DesignColors')
export class DesignColor {
  @PrimaryGeneratedColumn()
  ColorID: number;

  @Column({ type: 'varchar', length: 100 })
  Barcode: string;

  @Column({ type: 'varchar', length: 50 })
  ColorName: string;
}