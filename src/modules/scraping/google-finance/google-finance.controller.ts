import { Body, Controller, Post } from '@nestjs/common';
import { GoogleFinanceService } from './google-finance.service';
import { GetMultipleStocksDto, GetStockDto } from './dto/get-stock.dto';

@Controller('google-finance')
export class GoogleFinanceController {
  constructor(private readonly googleFinanceService: GoogleFinanceService) {}
}
