import { Controller, Get, Post, Body } from '@nestjs/common';

import { User as UserModel } from '@prisma/client';
import { UserService } from '../service/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(): Promise<UserModel[]> {
    return this.userService.getUsers({});
  }

  @Post()
  async signupUser(
    @Body() userData: { name?: string; email: string },
  ): Promise<UserModel> {
    console.log(userData);
    return this.userService.createUser(userData);
  }
}
