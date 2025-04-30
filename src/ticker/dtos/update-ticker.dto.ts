import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTickerDto {
  @ApiPropertyOptional({ example: '175.50', description: 'The opening price' })
  @IsOptional()
  @IsString()
  readonly open?: string;

  @ApiPropertyOptional({ example: '178.00', description: 'The highest price of the day' })
  @IsOptional()
  @IsString()
  readonly high?: string;

  @ApiPropertyOptional({ example: '174.00', description: 'The lowest price of the day' })
  @IsOptional()
  @IsString()
  readonly low?: string;

  @ApiPropertyOptional({ example: '177.25', description: 'The current price' })
  @IsOptional()
  @IsString()
  readonly price?: string;

  @ApiPropertyOptional({ example: '98765432', description: 'The trading volume' })
  @IsOptional()
  @IsString()
  readonly volume?: string;

  @ApiPropertyOptional({ example: '2023-10-27', description: 'The latest trading day' })
  @IsOptional()
  @IsString()
  readonly latest_trading_day?: string;

  @ApiPropertyOptional({ example: '175.00', description: 'The previous closing price' })
  @IsOptional()
  @IsString()
  readonly previous_close?: string;

  @ApiPropertyOptional({ example: '+2.25', description: 'The change in price' })
  @IsOptional()
  @IsString()
  readonly change?: string;

  @ApiPropertyOptional({ example: '+1.29%', description: 'The percentage change in price' })
  @IsOptional()
  @IsString()
  readonly change_percent?: string;
}
