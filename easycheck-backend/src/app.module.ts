import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssistanceModule } from './assistance/Assistance.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AssistanceModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
