import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsNotEmpty, MinLength, MaxLength} from 'class-validator';

export class CreateTickerDto {
  @ApiProperty({example: 'AAPL', description: 'The stock symbol', minLength: 1, maxLength: 10})
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  readonly symbol: string;
}
