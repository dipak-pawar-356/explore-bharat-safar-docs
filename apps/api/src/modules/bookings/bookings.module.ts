// Explore Bharat Safar — Section 3: Travel Booking Engine Module
// Reference: EBS-DOC-14-BOOKING, EBS-BLU-43-BKG

import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingInventoryService } from './booking-inventory.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, BookingInventoryService],
  exports: [BookingsService, BookingInventoryService],
})
export class BookingsModule {}
