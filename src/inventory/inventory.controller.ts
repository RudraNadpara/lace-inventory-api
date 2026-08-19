import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { InventoryService } from './inventory.service';

export class ScanDto {
  barcode!: string;
  type!: 'INWARD' | 'OUTWARD';
  qty!: number;
}

export class CreateDesignDto {
  designNo!: string;
  color!: string;
  size!: string;
  price!: number;
  barcode!: string;
  imageData?: string;
}

@Controller('api/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('scan')
  async handleScan(@Body() body: ScanDto) {
    if (!body.barcode || !body.type || !body.qty) {
      throw new HttpException('Missing required fields', HttpStatus.BAD_REQUEST);
    }
    return await this.inventoryService.processScan(body.barcode, body.type, body.qty);
  }

  @Post('design')
  async createDesign(@Body() body: CreateDesignDto) {
    if (!body.designNo || !body.barcode) {
      throw new HttpException('Design No and Barcode are required.', HttpStatus.BAD_REQUEST);
    }
    return await this.inventoryService.createDesign(
      body.designNo,
      body.color || '',
      body.size || '',
      body.price || 0.00,
      body.barcode,
      body.imageData || '' // Pass it to the service
    );
  }

  @Get('ledger')
  async getLedger() {
    return await this.inventoryService.getLiveLedger();
  }

  @Get('designs')
  async getDesigns() {
    return await this.inventoryService.getRecentDesigns();
  }
}