import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { DataService } from 'src/data-service/data.service';
import { UserRepository } from './repository/user.repository';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, DataService, UserRepository],
  exports: [],
})
export class UserModule {}
