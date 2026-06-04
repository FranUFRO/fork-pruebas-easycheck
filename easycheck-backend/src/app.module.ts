import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssistanceModule } from './assistance/Assistance.module';
import { SubjectModule } from './subject/Subject.module';

@Module({
  imports: [AssistanceModule, SubjectModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
