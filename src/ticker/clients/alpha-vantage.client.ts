import {Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {ConfigService} from '@nestjs/config';
import {firstValueFrom} from 'rxjs';
import {TickerApiClient} from '../abstract/ticker-api-client.abstract';
import {AlphaVantageResponseDto} from '../dtos/alpha-vantage-response.dto';
import {Result, success, failure} from '../../common/utils/result';
import {TickerApiClientError, TickerApiBadResponseError, TickerNotFoundError} from '../../common/errors/custom.errors';
import {AxiosError} from 'axios';

@Injectable()
export class AlphaVantageClient implements TickerApiClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://www.alphavantage.co/query';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('ALPHA_VANTAGE_API_KEY');
    if (!this.apiKey) {
      throw new Error('ALPHA_VANTAGE_API_KEY is not configured.');
    }
  }

  async fetchTickerData(symbol: string): Promise<Result<AlphaVantageResponseDto, TickerApiClientError | TickerApiBadResponseError | TickerNotFoundError>> {
    const url = `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`;

    try {
      const response = await firstValueFrom(this.httpService.get<AlphaVantageResponseDto>(url));

      const quoteData = response.data['Global Quote'];

      if (!quoteData || Object.keys(quoteData).length === 0) {
        return failure(new TickerNotFoundError(symbol));
      }

      if (!quoteData['01. symbol'] || !quoteData['05. price']) {
        return failure(new TickerApiBadResponseError(
          quoteData['01. symbol'],
          'Received malformed data from Alpha Vantage'),
        );
      }

      return success(response.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        return failure(new TickerApiClientError(`API request failed: ${error.message}`));
      }
      return failure(new TickerApiClientError('An unexpected error occurred while fetching data'));
    }
  }
}
