import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('DesignCollection')
export class DesignCollection {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  Barcode: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  DesignNo: string;

  @Column({ type: 'text', nullable: true })
  ImageURL: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  Price: number;
}