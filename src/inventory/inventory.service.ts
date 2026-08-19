import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class InventoryService {
  constructor(private dataSource: DataSource) {}

  // 1. SCAN LOGIC
  async processScan(barcode: string, type: 'INWARD' | 'OUTWARD', qty: number) {
    try {
      const result = await this.dataSource.query(
        `CALL sp_ProcessInventoryScan(?, ?, ?)`,
        [barcode, type, qty]
      );

      if (result && result[0] && result[0][0]) {
        return {
          success: true,
          data: result[0][0],
        };
      }
      
      throw new Error('No data returned from procedure.');
    } catch (error: any) {
      throw new InternalServerErrorException(error.message || 'Transaction failed');
    }
  }

  // 2. CREATE DESIGN LOGIC (With Image Upload)
  async createDesign(designNo: string, color: string, size: string, price: number, barcode: string, imageData: string) {
    try {
      await this.dataSource.query(
        `INSERT INTO DesignCollection (Barcode, DesignNo, Color, PacketSize, Price, ImageData) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [barcode, designNo, color, Number(size), price, imageData]
      );

      return { success: true, message: `Design ${designNo} added to master.` };
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new InternalServerErrorException('This Barcode already exists in the system.');
      }
      throw new InternalServerErrorException(error.message || 'Failed to save design master.');
    }
  }

  // 3. LIVE LEDGER LOGIC (Updated to include Price)
  async getLiveLedger() {
    try {
      const result = await this.dataSource.query(`
        SELECT 
            d.DesignNo, 
            d.Color, 
            d.PacketSize AS Size, 
            d.Price, /* <-- NEW: Fetch the price */
            d.Barcode,
            d.ImageData,
            IFNULL(SUM(CASE WHEN l.TransactionType = 'INWARD' THEN l.Quantity ELSE 0 END), 0) - 
            IFNULL(SUM(CASE WHEN l.TransactionType = 'OUTWARD' THEN l.Quantity ELSE 0 END), 0) AS LiveStock
        FROM DesignCollection d
        LEFT JOIN StockLedger l ON d.Barcode = l.Barcode
        GROUP BY d.Barcode, d.DesignNo, d.Color, d.PacketSize, d.Price, d.ImageData
        ORDER BY d.CreatedDate DESC
      `);

      return { success: true, data: result };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message || 'Failed to fetch ledger.');
    }
  }

  // 4. PRINT LABELS LOGIC
  async getRecentDesigns() {
    try {
      const result = await this.dataSource.query(`
        SELECT DesignNo, Color, PacketSize AS Size, Barcode, CreatedDate 
        FROM DesignCollection 
        ORDER BY CreatedDate DESC 
        LIMIT 50
      `);

      return { success: true, data: result };
    } catch (error: any) {
      throw new InternalServerErrorException(error.message || 'Failed to fetch designs.');
    }
  }
}