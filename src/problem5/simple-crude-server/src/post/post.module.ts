import { Module } from '@nestjs/common';
import { PostController } from './controller/post.controller';
import { PostService } from './service/post.service';
import { DataService } from 'src/data-service/data.service';
import { PostRepository } from './repository/post.repository';

@Module({
  imports: [],
  controllers: [PostController],
  providers: [PostService, DataService, PostRepository],
  exports: [],
})
export class PostModule {}
