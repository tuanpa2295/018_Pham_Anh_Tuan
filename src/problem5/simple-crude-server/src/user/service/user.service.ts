import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { UserRepository } from '../repository/user.repository';
// import { DataService } from 'src/data-service/data.service';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.userRepository.user(userWhereUniqueInput);
  }

  async getUsers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    return this.userRepository.getUsers(params);
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.userRepository.createUser(data);
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    return this.userRepository.updateUser(params);
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.userRepository.deleteUser(where);
  }
}
