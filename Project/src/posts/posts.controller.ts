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
} from "@nestjs/common";
import { PostsService } from "./posts.service";
import { AccessTokenGuard } from "src/auth/guard/bearer-token.guard";
import { UsersModel } from "src/users/entities/users.entity";
import { User } from "src/users/decorator/user.decorator";
import { CreatePostDto } from "./dto/create-post.dto";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) GET /posts
  //    모든 post를 다 가져온다.
  @Get()
  getPosts() {
    return this.postsService.getAllPosts();
  }

  // 2) GET /posts/:id
  //    id에 해당되는 post를 가져온다.
  @Get(":id")
  getPost(@Param("id", ParseIntPipe) postId: number) {
    return this.postsService.getPostById(postId);
  }

  // 3) POST /posts
  //    Post를 생성한다.
  @Post()
  @UseGuards(AccessTokenGuard)
  postPosts(
    @User("id") userId: number,
    @Body() createPostDto: CreatePostDto,
    // @Body("isPublic", new DefaultValuePipe(true)) isPublick: boolean,
  ) {
    // console.log(createPostDto);
    return this.postsService.createPost(userId, createPostDto);
  }

  // 4) PUT /posts/:id
  //    id에 해당되는 post를 변경한다.
  @Put(":id")
  putPost(
    @Param("id", ParseIntPipe) id: number,
    @Body("title") title?: string,
    @Body("content") content?: string,
  ) {
    return this.postsService.updatePost(id, title, content);
  }

  // 5) DELETE /posts/:id
  //    id에 해당되는 post를 삭제한다.
  @Delete(":id")
  deletePost(@Param("id", ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
