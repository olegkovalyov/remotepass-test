import { StoredTickerData } from '../dtos/stored-ticker-data.dto';
import { Result } from '../../common/utils/result';
import { TickerRepositoryError, TickerNotFoundError } from '../../common/errors/custom.errors';

export type CreateResult = Result<StoredTickerData, TickerRepositoryError>;
export type FindAllResult = Result<StoredTickerData[], TickerRepositoryError>;
export type FindOneResult = Result<StoredTickerData, TickerNotFoundError | TickerRepositoryError>;
export type UpdateResult = Result<StoredTickerData, TickerNotFoundError | TickerRepositoryError>;
export type RemoveResult = Result<void, TickerNotFoundError | TickerRepositoryError>;
export type ExistsResult = Result<boolean, TickerRepositoryError>;

export abstract class TickerRepository {
    abstract create(tickerData: StoredTickerData): Promise<CreateResult>;
    abstract findAll(): Promise<FindAllResult>;
    abstract findOne(symbol: string): Promise<FindOneResult>;
    abstract update(symbol: string, updateData: Partial<StoredTickerData>): Promise<UpdateResult>;
    abstract remove(symbol: string): Promise<RemoveResult>;
    abstract exists(symbol: string): Promise<ExistsResult>;
}
