import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GadgetsModule } from './gadgets/gadgets.module';

@Module({
  imports: [GadgetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
