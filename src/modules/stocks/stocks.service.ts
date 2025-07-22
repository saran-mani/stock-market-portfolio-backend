import { Injectable } from '@nestjs/common';
import { stocksData } from './stocks.data';
import { GoogleFinanceService } from './../scraping/google-finance/google-finance.service';

@Injectable()
export class StocksService {
  constructor(private readonly googleFinanceService: GoogleFinanceService) {}

  private stocks = stocksData;

  private parsePrice(price: string | number | null): number | null {
    if (typeof price === 'string') {
      const numericString = price.replace(/[₹,]/g, '');
      const parsed = parseFloat(numericString);
      return isNaN(parsed) ? null : parsed;
    }
    return typeof price === 'number' ? price : null;
  }

  async findAllStocksData() {
    const stockInputs = this.stocks.map((stock) => ({
      symbol: stock.tickerSymbol,
      exchange: stock.exchangeName,
    }));

    const pricesMap =
      await this.googleFinanceService.getMultipleStockPrices(stockInputs);

    const result = this.stocks.map((stock) => {
      const key = `${stock.tickerSymbol}:${stock.exchangeName}`;
      const rawData = pricesMap[key] ?? { price: null, peRatio: null };
      const currentPrice: number = this.parsePrice(rawData.price) || 0;
      const investment = stock.buyPrice * stock.quantityHeld;
      const presentValue = parseFloat(
        (currentPrice * stock.quantityHeld).toFixed(2),
      );
      const PL = parseFloat((presentValue - investment).toFixed(2));

      const peRatio = Number(rawData.peRatio) || 0;

      return {
        ...stock,
        currentPrice,
        investment,
        presentValue,
        PL,
        peRatio,
      };
    });

    return { stocks: result };
  }

  async findAll() {
    return stocksData.map((stock) => {
      const investment = stock.buyPrice * stock.quantityHeld;

      return {
        ...stock,
        investment,
      };
    });
  }
}
