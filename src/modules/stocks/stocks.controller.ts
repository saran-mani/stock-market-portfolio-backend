import { Controller, Get } from '@nestjs/common';
import { StocksService } from './stocks.service';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}
  @Get()
  async findAll() {
    return this.stocksService.findAll();
  }

  @Get('/stock-data')
  async findAllStockData() {
    return this.stocksService.findAllStocksData();
  }
}
