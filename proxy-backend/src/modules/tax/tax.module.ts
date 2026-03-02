import { Module } from '@nestjs/common';
import { TaxService } from './tax.service';
import { EtimsService } from './etims/etims.service';

@Module({
  providers: [TaxService, EtimsService],
  exports: [TaxService],
})
export class TaxModule {}
