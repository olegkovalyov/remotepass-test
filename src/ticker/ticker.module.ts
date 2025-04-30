import { Module } from '@nestjs/common';
import { TickerController } from './controllers/ticker.controller';
import { TickerService } from './services/ticker.service';
import { HttpModule } from '@nestjs/axios';
import { TickerRepository } from './abstract/ticker-repository.abstract';
import { InMemoryTickerRepository } from './repositories/in-memory-ticker.repository';
import { TickerApiClient } from './abstract/ticker-api-client.abstract';
import { AlphaVantageClient } from './clients/alpha-vantage.client';

@Module({
  imports: [HttpModule],
  controllers: [TickerController],
  providers: [
    TickerService,
    { provide: TickerRepository, useClass: InMemoryTickerRepository },
    { provide: TickerApiClient, useClass: AlphaVantageClient },
  ]
})
export class TickerModule {}
