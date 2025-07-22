import { Injectable, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';

@Injectable()
export class GoogleFinanceService implements OnModuleDestroy {
  private browser: Browser | null = null;

  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true, // headless improves speed
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
  }
  async getStockPrice(
    symbol: string,
    exchange: string,
  ): Promise<string | null> {
    await this.initBrowser();
    const url = `https://www.google.com/finance/quote/${symbol}:${exchange}`;
    const page = await this.browser!.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

      const priceSelector = 'div.YMlKec.fxKbKc';
      await page.waitForSelector(priceSelector, {
        visible: true,
        timeout: 10000,
      });

      const price = await page.$eval(
        priceSelector,
        (el) => el.textContent?.trim() || null,
      );
      console.log(`${symbol}:${exchange} → ${price}`);
      return price;
    } catch (err) {
      console.error(`Error fetching ${symbol}:${exchange}: ${err.message}`);
      return null;
    } finally {
      await page.close();
    }
  }

  private async fetchPrice(
    symbol: string,
    exchange: string,
  ): Promise<{ key: string; price: string | null; peRatio: string | null }> {
    const url = `https://www.google.com/finance/quote/${symbol}:${exchange}`;
    const key = `${symbol}:${exchange}`;
    const page = await this.browser!.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

      const priceSelector = 'div.YMlKec.fxKbKc';
      await page.waitForSelector(priceSelector, {
        visible: true,
        timeout: 10000,
      });

      const price = await page.$eval(
        priceSelector,
        (el) => el.textContent?.trim() || null,
      );

      const peRatio = await page.evaluate(() => {
        const rows = document.querySelectorAll('div.gyFHrc');
        for (const row of rows) {
          const label = row.querySelector('div.mfs7Fc')?.textContent?.trim();
          if (label === 'P/E ratio') {
            return row.querySelector('div.P6K39c')?.textContent?.trim() || null;
          }
        }
        return null;
      });

      console.log(`${key} → ${price}`);
      return { key, price, peRatio };
    } catch (err) {
      console.error(`Error fetching ${key}: ${err.message}`);
      return { key, price: null, peRatio: null };
    } finally {
      await page.close();
    }
  }

  async getMultipleStockPrices(
    stocks: { symbol: string; exchange: string }[],
    concurrencyLimit = 5,
  ): Promise<Record<string, { price: string | null; peRatio: string | null }>> {
    await this.initBrowser();
    const queue = [...stocks];
    const results: Record<
      string,
      { price: string | null; peRatio: string | null }
    > = {};

    const workers = Array.from({ length: concurrencyLimit }, async () => {
      while (queue.length) {
        const { symbol, exchange } = queue.shift()!;
        const { key, price, peRatio } = await this.fetchPrice(symbol, exchange);
        results[key] = { price, peRatio };
      }
    });

    await Promise.all(workers);

    return results;
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
