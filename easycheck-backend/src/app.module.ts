import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssistanceModule } from './assistance/Assistance.module';

@Module({
  imports: [AssistanceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
