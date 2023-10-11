import { Injectable } from '@nestjs/common';
import { Post, Prisma } from '@prisma/client';
import { PostRepository } from '../repository/post.repository';

@Injectable()
export class PostService {
  constructor(private postRepository: PostRepository) {}

  async post(
    postWhereUniqueInput: Prisma.PostWhereUniqueInput,
  ): Promise<Post | null> {
    return this.postRepository.post(postWhereUniqueInput);
  }

  async getPosts(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PostWhereUniqueInput;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  }): Promise<Post[]> {
    return this.postRepository.getPosts(params);
  }

  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    return this.postRepository.createPost(data);
  }

  async updatePost(params: {
    where: Prisma.PostWhereUniqueInput;
    data: Prisma.PostUpdateInput;
  }): Promise<Post> {
    return this.postRepository.updatePost(params);
  }

  async deletePost(where: Prisma.PostWhereUniqueInput): Promise<Post> {
    return this.postRepository.deletePost(where);
  }
}
