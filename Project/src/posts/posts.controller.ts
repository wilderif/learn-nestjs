import {
  Controller,
  Param,
  Body,
  Get,
  Post,
  Put,
  Delete,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Request,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  UploadedFile,
  InternalServerErrorException,
} from "@nestjs/common";
import { PostsService } from "./posts.service";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { User } from "src/users/decorator/user.decorator";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "./dto/paginate-post.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { ImageModelType } from "src/common/entity/image.entity";
import { DataSource, QueryRunner } from "typeorm";
import { PostsImagesService } from "./image/images.service";
import { LogInterceptor } from "src/common/interceptor/log.interceptor";
import { TransactionInterceptor } from "src/common/interceptor/transaction.interceptor";
import { QueryRunnerDecorator } from "src/common/decorator/query-runner.decorator";

@Controller("posts")
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsImagesService: PostsImagesService,
  ) {}

  // POST /posts/dummy
  @Post("dummy")
  @UseGuards(AccessTokenGuard)
  async postPostsDummy(@User("id") userId: number) {
    await this.postsService.generateDummyPosts(userId);
    return true;
  }

  // 1) GET /posts
  //    모든 post를 다 가져온다.
  @Get()
  // @UseInterceptors(ClassSerializerInterceptor)
  @UseInterceptors(LogInterceptor)
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  // 2) GET /posts/:id
  //    id에 해당되는 post를 가져온다.
  @Get(":id")
  getPost(@Param("id", ParseIntPipe) postId: number) {
    return this.postsService.getPostById(postId);
  }

  // 3) POST /posts
  //    Post를 생성한다.
  // A Model, B Model
  // Post API -> A Model을 저장하고, B Model을 저장한다.
  // await repository.save(A Model);
  // await repository.save(B Model);
  //
  // 만약에 A Model을 저장하다가 실패하면, B Model을 저장하면 안 될경우.
  // Transaction
  // all or nothing
  //
  // start - 시작
  // commit - 저장
  // rollback - 원상복구
  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  async postPosts(
    @User("id") userId: number,
    @Body() createPostDto: CreatePostDto,
    @QueryRunnerDecorator() queryRunner: QueryRunner,
    // @Body("isPublic", new DefaultValuePipe(true)) isPublick: boolean,
  ) {
    // // transaction과 관련된 모든 쿼리를 담당할 queryRunner를 생성한다.
    // const queryRunner = this.dataSource.createQueryRunner();
    // // queryRunner에 연결한다.
    // await queryRunner.connect();
    // // transaction을 시작한다.
    // // 이 시점부터 같은 queryRunner를 사용하면,
    // // transaction 안에서 database action을 실행할 수 있다.
    // await queryRunner.startTransaction();
    // // 로직 실행
    // try {
    //   const post = await this.postsService.createPost(
    //     userId,
    //     createPostDto,
    //     queryRunner,
    //   );
    //   for (let i = 0; i < createPostDto.images.length; i++) {
    //     await this.postsImagesService.createPostImage(
    //       {
    //         post,
    //         order: i,
    //         path: createPostDto.images[i],
    //         type: ImageModelType.POST_IMAGE,
    //       },
    //       queryRunner,
    //     );
    //   }
    //   await queryRunner.commitTransaction();
    //   await queryRunner.release();
    //   return this.postsService.getPostById(post.id);
    // } catch (error) {
    //   // 어떤 에러든 에러가 발생하면,
    //   // transaction을 종료하고 원래 상태로 되돌린다.
    //   // transaction을 rollback한다.
    //   await queryRunner.rollbackTransaction();
    //   await queryRunner.release();
    //   throw new InternalServerErrorException("Error while creating post");
    // }

    const post = await this.postsService.createPost(
      userId,
      createPostDto,
      queryRunner,
    );

    for (let i = 0; i < createPostDto.images.length; i++) {
      await this.postsImagesService.createPostImage(
        {
          post,
          order: i,
          path: createPostDto.images[i],
          type: ImageModelType.POST_IMAGE,
        },
        queryRunner,
      );
    }

    return this.postsService.getPostById(post.id, queryRunner);
  }

  // 4) PUT /posts/:id
  //    id에 해당되는 post를 변경한다.
  @Patch(":id")
  patchPost(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    // @Body("title") title?: string,
    // @Body("content") content?: string,
  ) {
    return this.postsService.updatePost(id, updatePostDto);
  }

  // 5) DELETE /posts/:id
  //    id에 해당되는 post를 삭제한다.
  @Delete(":id")
  deletePost(@Param("id", ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
