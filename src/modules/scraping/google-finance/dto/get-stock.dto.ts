import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsDefined, IsString, ValidateNested } from 'class-validator';

export class GetStockDto {
  @ApiProperty({ example: 'HDFCBANK' })
  @IsDefined({ message: 'Stock Name is required' })
  @IsString({ message: 'Please enters a valid Stock name or id' })
  stock: string;
}

export class StockInput {
  @IsString()
  symbol: string;

  @IsString()
  exchange: string;
}

export class GetMultipleStocksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockInput)
  stocks: StockInput[];
}
