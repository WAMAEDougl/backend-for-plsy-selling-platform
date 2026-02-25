import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProxiesModule } from './modules/proxies/proxies.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TaxModule } from './modules/tax/tax.module';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [AuthModule, UsersModule, ProxiesModule, PaymentsModule, TaxModule, FilesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
