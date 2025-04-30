import { Module } from '@nestjs/common';
import { TickerModule } from './ticker/ticker.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TickerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
