import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryModule } from './inventory/inventory.module'; // Ensure this only appears once

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: 'avnadmin',
      password: process.env.DB_PASSWORD,
      database: 'defaultdb',
      autoLoadEntities: true,
      synchronize: false,
      ssl: {
        rejectUnauthorized: false 
      }
    }),
    InventoryModule, // Ensure this only appears once in the array
  ],
})
export class AppModule {}