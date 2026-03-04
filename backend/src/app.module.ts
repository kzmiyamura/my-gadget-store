import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GadgetsModule } from './gadgets/gadgets.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [GadgetsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
