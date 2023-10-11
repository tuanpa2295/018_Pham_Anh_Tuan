import { Module } from '@nestjs/common';
import { DataModule } from './data-service/data.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [DataModule, UserModule, PostModule, ConfigModule.forRoot({})],
  controllers: [],
  providers: [],
})
export class AppModule {}
