import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DesignCollection } from './entities/design-collection.entity';
import { DesignColor } from './entities/design-color.entity';
import { StockLedger } from './entities/stock-ledger.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(DesignCollection)
    private designRepo: Repository<DesignCollection>,
    @InjectRepository(DesignColor)
    private colorRepo: Repository<DesignColor>,
    @InjectRepository(StockLedger)
    private ledgerRepo: Repository<StockLedger>,
  ) {}

  // 1. ENTRY: Save Design and its allowed colors
  async createDesign(data: { designNo: string; price: number; imageUrl: string; colors: string[] }) {
    const barcode = `LACE-${data.designNo.toUpperCase()}`; // 1 Label per design

    const design = this.designRepo.create({
      Barcode: barcode,
      DesignNo: data.designNo,
      Price: data.price,
      ImageURL: data.imageUrl,
    });
    await this.designRepo.save(design);

    for (const colorName of data.colors) {
      const color = this.colorRepo.create({ Barcode: barcode, ColorName: colorName });
      await this.colorRepo.save(color);
    }
    return { message: 'Design saved', barcode };
  }

  // 2. LABEL: Get Master Designs
  async getDesigns() {
    return this.designRepo.find();
  }

  // 3. SCAN (INFO): Fetch Design details and stock per color for the scanner popup
  async getDesignInfo(barcode: string) {
    const design = await this.designRepo.findOne({ where: { Barcode: barcode } });
    if (!design) throw new NotFoundException('Barcode not found in Master.');

    const colors = await this.colorRepo.find({ where: { Barcode: barcode } });
    const stockSummary = [];

    // Calculate current stock for each specific color
    for (const c of colors) {
      const inward = await this.ledgerRepo.sum('Quantity', { Barcode: barcode, Color: c.ColorName, TransactionType: 'INWARD' }) || 0;
      const outward = await this.ledgerRepo.sum('Quantity', { Barcode: barcode, Color: c.ColorName, TransactionType: 'OUTWARD' }) || 0;
      
      stockSummary.push({
        color: c.ColorName,
        stock: inward - outward
      });
    }

    return {
      designNo: design.DesignNo,
      price: design.Price,
      imageUrl: design.ImageURL,
      colorStock: stockSummary
    };
  }

  // 4. SCAN (ACTION): Save the Inward/Outward transaction
  async processScan(data: { barcode: string; color: string; type: string; qty: number }) {
    const tx = this.ledgerRepo.create({
      Barcode: data.barcode,
      Color: data.color,
      TransactionType: data.type,
      Quantity: data.qty
    });
    return this.ledgerRepo.save(tx);
  }

  // 5. LEDGER: Get all rows joined with the DesignNo
  async getLedger() {
    return this.ledgerRepo.createQueryBuilder('ledger')
      .leftJoinAndMapOne('ledger.design', DesignCollection, 'design', 'design.Barcode = ledger.Barcode')
      .orderBy('ledger.TxDate', 'DESC')
      .getRawMany(); 
  }

  // 6. LEDGER (EDIT): Update packet quantity
  async updateLedgerRow(id: number, qty: number) {
    await this.ledgerRepo.update(id, { Quantity: qty });
    return { message: 'Quantity updated' };
  }

  // 7. LEDGER (DELETE): Remove accidental scan
  async deleteLedgerRow(id: number) {
    await this.ledgerRepo.delete(id);
    return { message: 'Transaction deleted' };
  }

  // 8. REPORT: Get current stock summary grouped by Design and Color
  async getStockReport() {
    return this.ledgerRepo.createQueryBuilder('ledger')
      .select('design.DesignNo', 'designNo')
      .addSelect('ledger.Color', 'color')
      .addSelect('design.Price', 'price')
      .addSelect("SUM(CASE WHEN ledger.TransactionType = 'INWARD' THEN ledger.Quantity ELSE 0 END) - SUM(CASE WHEN ledger.TransactionType = 'OUTWARD' THEN ledger.Quantity ELSE 0 END)", 'currentStock')
      .leftJoin(DesignCollection, 'design', 'design.Barcode = ledger.Barcode')
      .groupBy('design.DesignNo')
      .addGroupBy('ledger.Color')
      .addGroupBy('design.Price')
      .orderBy('design.DesignNo', 'ASC')
      .getRawMany();
  }
}