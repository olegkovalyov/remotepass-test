import { Controller, Get, Post, Body, Param, Delete, Put, HttpCode, HttpStatus, ValidationPipe, ParseUUIDPipe, UsePipes, HttpException } from '@nestjs/common';
import { TickerService } from '../services/ticker.service';
import { CreateTickerDto } from '../dtos/create-ticker.dto';
import { UpdateTickerDto } from '../dtos/update-ticker.dto';
import { StoredTickerData } from '../dtos/stored-ticker-data.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { hasError } from '../../common/utils/result';
import {
  TickerNotFoundError,
  TickerConflictError,
  TickerValidationError,
  TickerApiClientError,
  TickerApiBadResponseError,
} from '../../common/errors/custom.errors';

@ApiTags('tickers')
@Controller('tickers')
export class TickerController {
  constructor(private readonly tickerService: TickerService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new stock ticker by symbol' })
  @ApiBody({ type: CreateTickerDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Ticker created and data fetched successfully.', type: StoredTickerData })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input symbol (e.g., empty).' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Ticker symbol already exists.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Ticker symbol not found by external API during fetch.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error during creation or fetch.' })
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() createTickerDto: CreateTickerDto): Promise<StoredTickerData> {
    const createResult = await this.tickerService.create(createTickerDto);

    if (hasError(createResult)) {
      if (createResult.error instanceof TickerConflictError) {
        throw new HttpException(createResult.error.message, HttpStatus.CONFLICT);
      } else if (createResult.error instanceof TickerValidationError) {
        throw new HttpException(createResult.error.message, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    const fetchResult = await this.tickerService.fetchAndStoreTicker(createTickerDto.symbol);

    if (hasError(fetchResult)) {
      if (fetchResult.error instanceof TickerNotFoundError) {
        throw new HttpException(`Ticker ${createTickerDto.symbol} not found by API or during storage`, HttpStatus.NOT_FOUND);
      } else if (fetchResult.error instanceof TickerApiClientError || fetchResult.error instanceof TickerApiBadResponseError) {
        throw new HttpException('Failed to fetch data from external API', HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new HttpException('Internal server error during data storage', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    return fetchResult.value;
  }

  @Get()
  @ApiOperation({ summary: 'Get all stored stock tickers' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of all stored tickers.', type: [StoredTickerData] })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error fetching tickers.' })
  async findAll(): Promise<StoredTickerData[]> {
    const result = await this.tickerService.findAll();

    if (hasError(result)) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result.value;
  }

  @Get(':symbol')
  @ApiOperation({ summary: 'Get ticker data by symbol' })
  @ApiParam({ name: 'symbol', description: 'The stock ticker symbol (e.g., IBM)', type: String })
  @ApiResponse({ status: HttpStatus.OK, description: 'Ticker data found.', type: StoredTickerData })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Ticker symbol not found in storage.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error fetching ticker.' })
  async findOne(@Param('symbol') symbol: string): Promise<StoredTickerData> {
    const result = await this.tickerService.findOne(symbol);

    if (hasError(result)) {
      if (result.error instanceof TickerNotFoundError) {
        throw new HttpException(`Ticker ${symbol} not found`, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    return result.value;
  }

  @Put(':symbol')
  @ApiOperation({ summary: 'Update stored ticker data by symbol' })
  @ApiParam({ name: 'symbol', description: 'The stock ticker symbol to update', type: String })
  @ApiBody({ type: UpdateTickerDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Ticker data successfully updated.', type: StoredTickerData })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Ticker symbol not found in storage.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error during update.' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  async update(@Param('symbol') symbol: string, @Body() updateTickerDto: UpdateTickerDto): Promise<StoredTickerData> {
    const result = await this.tickerService.update(symbol, updateTickerDto);

    if (hasError(result)) {
      if (result.error instanceof TickerNotFoundError) {
        throw new HttpException(`Ticker ${symbol} not found for update`, HttpStatus.NOT_FOUND);
      } else if (result.error instanceof TickerValidationError) {
        throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    return result.value;
  }

  @Delete(':symbol')
  @ApiOperation({ summary: 'Delete a stored ticker by symbol' })
  @ApiParam({ name: 'symbol', description: 'The stock ticker symbol to delete', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Ticker successfully deleted.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Ticker symbol not found in storage.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error during deletion.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('symbol') symbol: string): Promise<void> {
    const result = await this.tickerService.remove(symbol);

    if (hasError(result)) {
      if (result.error instanceof TickerNotFoundError) {
        throw new HttpException(`Ticker ${symbol} not found for removal`, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
