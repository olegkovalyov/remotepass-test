import { Injectable } from '@nestjs/common';
import { TickerRepository } from '../abstract/ticker-repository.abstract';
import { StoredTickerData } from '../dtos/stored-ticker-data.dto';
import { Result, success, failure, hasError } from '../../common/utils/result';
import { TickerNotFoundError, TickerConflictError, TickerRepositoryError } from '../../common/errors/custom.errors';

@Injectable()
export class InMemoryTickerRepository implements TickerRepository {
  private storage: Record<string, StoredTickerData> = {};

  async create(tickerData: StoredTickerData): Promise<Result<StoredTickerData, TickerConflictError>> {
    const upperSymbol = tickerData.symbol.toUpperCase();
    if (this.storage[upperSymbol]) {
      return failure(new TickerConflictError(upperSymbol));
    }
    this.storage[upperSymbol] = tickerData;
    return success(this.storage[upperSymbol]);
  }

  async findOne(symbol: string): Promise<Result<StoredTickerData, TickerNotFoundError>> {
    const upperSymbol = symbol.toUpperCase();
    const data = this.storage[upperSymbol];
    if (!data) {
      return failure(new TickerNotFoundError(upperSymbol));
    }
    return success(data);
  }

  async findAll(): Promise<Result<StoredTickerData[], TickerRepositoryError>> {
    try {
      const allData = Object.values(this.storage);
      return success(allData);
    } catch (error) {
      return failure(new TickerRepositoryError('Failed to retrieve all tickers from memory.'));
    }
  }

  async update(symbol: string, updateData: Partial<StoredTickerData>): Promise<Result<StoredTickerData, TickerNotFoundError>> {
    const upperSymbol = symbol.toUpperCase();
    const findResult = await this.findOne(upperSymbol);

    if (!findResult.success) {
      return findResult;
    }

    const existingData = findResult.value;
    const updatedData = { ...existingData, ...updateData };
    this.storage[upperSymbol] = updatedData;
    return success(updatedData);
  }

  async remove(symbol: string): Promise<Result<void, TickerNotFoundError>> {
    const upperSymbol = symbol.toUpperCase();
    if (!this.storage[upperSymbol]) {
      return failure(new TickerNotFoundError(upperSymbol));
    }
    delete this.storage[upperSymbol];
    return success(undefined); 
  }

  async exists(symbol: string): Promise<Result<boolean, TickerRepositoryError>> {
    try {
      const upperSymbol = symbol.toUpperCase();
      const exists = upperSymbol in this.storage;
      return success(exists);
    } catch (error) {
      return failure(new TickerRepositoryError('Failed to check existence in memory.'));
    }
  }
}
