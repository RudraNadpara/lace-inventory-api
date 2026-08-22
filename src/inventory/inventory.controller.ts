import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('api/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('design')
  createDesign(@Body() body: { designNo: string; price: number; imageUrl: string; colors: string[] }) {
    return this.inventoryService.createDesign(body);
  }

  @Get('designs')
  getDesigns() {
    return this.inventoryService.getDesigns();
  }

  @Get('scan/:barcode')
  getDesignInfo(@Param('barcode') barcode: string) {
    return this.inventoryService.getDesignInfo(barcode);
  }

  @Post('scan')
  processScan(@Body() body: { barcode: string; color: string; type: string; qty: number }) {
    return this.inventoryService.processScan(body);
  }

  @Get('ledger')
  getLedger() {
    return this.inventoryService.getLedger();
  }

  @Patch('ledger/:id')
  updateLedger(@Param('id') id: string, @Body('qty') qty: number) {
    return this.inventoryService.updateLedgerRow(Number(id), qty);
  }

  @Delete('ledger/:id')
  deleteLedger(@Param('id') id: string) {
    return this.inventoryService.deleteLedgerRow(Number(id));
  }

  @Get('report')
  getStockReport() {
    return this.inventoryService.getStockReport();
  }
}