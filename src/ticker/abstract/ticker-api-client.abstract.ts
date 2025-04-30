import {AlphaVantageResponseDto} from '../dtos/alpha-vantage-response.dto';
import {Result} from '../../common/utils/result';
import {TickerApiClientError, TickerApiBadResponseError} from '../../common/errors/custom.errors';

export type FetchTickerDataResult = Result<AlphaVantageResponseDto, TickerApiClientError | TickerApiBadResponseError>;

export abstract class TickerApiClient {
  abstract fetchTickerData(symbol: string): Promise<FetchTickerDataResult>;
}
