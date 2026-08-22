import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// Import all three entities at the top
import { DesignCollection } from './entities/design-collection.entity';
import { DesignColor } from './entities/design-color.entity';
import { StockLedger } from './entities/stock-ledger.entity';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  // Add DesignColor to the array here:
  imports: [TypeOrmModule.forFeature([DesignCollection, DesignColor, StockLedger])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}