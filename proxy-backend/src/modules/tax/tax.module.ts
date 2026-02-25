import { Module } from '@nestjs/common';
import { EtimsService } from './etims/etims.service';

@Module({
  providers: [EtimsService]
})
export class TaxModule {}
