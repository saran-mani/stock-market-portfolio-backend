import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { GoogleFinanceService } from '../scraping/google-finance/google-finance.service';
import { GoogleFinanceModule } from '../scraping/google-finance/google-finance.module';

@Module({
  imports:[GoogleFinanceModule],
  controllers: [StocksController],
  providers: [StocksService],
})
export class StocksModule {}
