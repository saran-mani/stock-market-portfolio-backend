import { Module } from '@nestjs/common';
import { GoogleFinanceService } from './google-finance.service';
import { GoogleFinanceController } from './google-finance.controller';

@Module({
  controllers: [GoogleFinanceController],
  providers: [GoogleFinanceService],
  exports:[GoogleFinanceService]
})
export class GoogleFinanceModule {}
