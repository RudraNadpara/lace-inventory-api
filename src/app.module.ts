import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryModule } from './inventory/inventory.module'; // Ensure this only appears once

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root', // Default XAMPP username
      password: '',     // Default XAMPP password is empty
      database: 'lace inventory app', // Ensure this matches your phpMyAdmin DB name
      autoLoadEntities: true,
      synchronize: false, 
    }),
    InventoryModule, // Ensure this only appears once in the array
  ],
})
export class AppModule {}