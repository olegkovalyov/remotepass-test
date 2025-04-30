import { Injectable, Inject } from '@nestjs/common';
import { CreateTickerDto } from '../dtos/create-ticker.dto';
import { UpdateTickerDto } from '../dtos/update-ticker.dto';
import { StoredTickerData } from '../dtos/stored-ticker-data.dto';
import { TickerRepository } from '../abstract/ticker-repository.abstract';
import { TickerApiClient } from '../abstract/ticker-api-client.abstract';
import { AlphaVantageResponseDto } from '../dtos/alpha-vantage-response.dto';
import { Result, success, failure, hasError } from '../../common/utils/result';
import {
  TickerRepositoryError,
  TickerNotFoundError,
  TickerConflictError,
  TickerApiClientError,
  TickerApiBadResponseError,
  TickerValidationError,
  AppError
} from '../../common/errors/custom.errors';

type CreateResult = Result<StoredTickerData, TickerConflictError | TickerRepositoryError | TickerValidationError>;
type FindAllResult = Result<StoredTickerData[], TickerRepositoryError>;
type FindOneResult = Result<StoredTickerData, TickerNotFoundError | TickerRepositoryError>;
type UpdateResult = Result<StoredTickerData, TickerNotFoundError | TickerRepositoryError | TickerValidationError>;
type RemoveResult = Result<void, TickerNotFoundError | TickerRepositoryError>;
type FetchResult = Result<StoredTickerData, TickerApiClientError | TickerNotFoundError | TickerApiBadResponseError | TickerRepositoryError>;

@Injectable()
export class TickerService {
  constructor(
    @Inject(TickerRepository)
    private readonly tickerRepository: TickerRepository,
    @Inject(TickerApiClient)
    private readonly tickerApiClient: TickerApiClient,
  ) {}

  async create(createTickerDto: CreateTickerDto): Promise<CreateResult> {
    const upperSymbol = createTickerDto.symbol?.toUpperCase();

    if (!upperSymbol) {
      return failure(new TickerValidationError('Symbol cannot be empty'));
    }

    const existsResult = await this.tickerRepository.exists(upperSymbol);
    if (hasError(existsResult)) {
      return failure(existsResult.error);
    }
    if (existsResult.success && existsResult.value) {
      return failure(new TickerConflictError(upperSymbol));
    }

    const initialData: StoredTickerData = {
      symbol: upperSymbol,
      open: '',
      high: '',
      low: '',
      price: '0',
      volume: '',
      latest_trading_day: '',
      previous_close: '',
      change: '',
      change_percent: '0%',
    };

    const createResult = await this.tickerRepository.create(initialData);

    if (hasError(createResult)) {
      return failure(createResult.error);
    }

    return success(createResult.value);
  }

  async findAll(): Promise<FindAllResult> {
    const result = await this.tickerRepository.findAll();
    if (hasError(result)) {
      return result;
    }
    return success(result.value);
  }

  async findOne(symbol: string): Promise<FindOneResult> {
    const upperSymbol = symbol.toUpperCase();
    const result = await this.tickerRepository.findOne(upperSymbol);
    if (hasError(result)) {
      if (result.error instanceof TickerNotFoundError) {
        return failure(result.error);
      } else {
        return failure(result.error);
      }
    }
    return success(result.value);
  }

  async update(symbol: string, updateTickerDto: UpdateTickerDto): Promise<UpdateResult> {
    const upperSymbol = symbol.toUpperCase();

    const partialData: Partial<StoredTickerData> = {};
    if (updateTickerDto.open !== undefined) partialData.open = updateTickerDto.open;
    if (updateTickerDto.high !== undefined) partialData.high = updateTickerDto.high;
    if (updateTickerDto.low !== undefined) partialData.low = updateTickerDto.low;
    if (updateTickerDto.price !== undefined) partialData.price = updateTickerDto.price;
    if (updateTickerDto.volume !== undefined) partialData.volume = updateTickerDto.volume;
    if (updateTickerDto.latest_trading_day !== undefined) partialData.latest_trading_day = updateTickerDto.latest_trading_day;
    if (updateTickerDto.previous_close !== undefined) partialData.previous_close = updateTickerDto.previous_close;
    if (updateTickerDto.change !== undefined) partialData.change = updateTickerDto.change;
    if (updateTickerDto.change_percent !== undefined) partialData.change_percent = updateTickerDto.change_percent;

    if (Object.keys(partialData).length === 0) {
      return failure(new TickerValidationError('No update data provided'));
    }

    const updateResult = await this.tickerRepository.update(upperSymbol, partialData);

    if (hasError(updateResult)) {
      if (updateResult.error instanceof TickerNotFoundError) {
        return failure(updateResult.error);
      } else {
        return failure(updateResult.error);
      }
    }

    return success(updateResult.value);
  }

  async remove(symbol: string): Promise<RemoveResult> {
    const upperSymbol = symbol.toUpperCase();
    const removeResult = await this.tickerRepository.remove(upperSymbol);

    if (hasError(removeResult)) {
      if (removeResult.error instanceof TickerNotFoundError) {
        return failure(removeResult.error);
      } else {
        return failure(removeResult.error);
      }
    }

    return success(undefined);
  }

  async fetchAndStoreTicker(symbol: string): Promise<FetchResult> {
    const upperSymbol = symbol.toUpperCase();

    const fetchResult = await this.tickerApiClient.fetchTickerData(upperSymbol);

    if (hasError(fetchResult)) {
      return failure(fetchResult.error);
    }

    const storedData = this.mapAlphaVantageToStoredData(fetchResult.value);

    const updateResult = await this.tickerRepository.update(upperSymbol, storedData);

    if (hasError(updateResult)) {
      return failure(updateResult.error);
    }

    return success(updateResult.value);
  }

  private mapAlphaVantageToStoredData(apiData: AlphaVantageResponseDto): StoredTickerData {
    const quote = apiData['Global Quote'];
    return {
      symbol: quote['01. symbol'].toUpperCase(),
      open: quote['02. open'],
      high: quote['03. high'],
      low: quote['04. low'],
      price: quote['05. price'],
      volume: quote['06. volume'],
      latest_trading_day: quote['07. latest trading day'],
      previous_close: quote['08. previous close'],
      change: quote['09. change'],
      change_percent: quote['10. change percent'],
    };
  }
}
