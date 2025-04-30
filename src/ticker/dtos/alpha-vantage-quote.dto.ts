import {ApiProperty} from '@nestjs/swagger';
import {IsString} from 'class-validator';

export class AlphaVantageQuoteDto {
  @ApiProperty({example: 'IBM', description: 'Ticker symbol'})
  @IsString()
  '01. symbol': string;

  @ApiProperty({example: '142.1000', description: 'Opening price'})
  @IsString()
  '02. open': string;

  @ApiProperty({example: '142.1700', description: 'Highest price'})
  @IsString()
  '03. high': string;

  @ApiProperty({example: '140.7800', description: 'Lowest price'})
  @IsString()
  '04. low': string;

  @ApiProperty({example: '141.0200', description: 'Current price'})
  @IsString()
  '05. price': string;

  @ApiProperty({example: '3887821', description: 'Trading volume'})
  @IsString()
  '06. volume': string;

  @ApiProperty({example: '2025-04-29', description: 'Latest trading day'})
  @IsString()
  '07. latest trading day': string;

  @ApiProperty({example: '142.5800', description: 'Previous close price'})
  @IsString()
  '08. previous close': string;

  @ApiProperty({example: '-1.5600', description: 'Change amount'})
  @IsString()
  '09. change': string;

  @ApiProperty({example: '-1.0941%', description: 'Change percent'})
  @IsString()
  '10. change percent': string;
}
