import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { PostsService } from "./posts.service";

interface PostModel {
  id: number;
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

let posts: PostModel[] = [
  {
    id: 1,
    author: "author 1",
    title: "title 1",
    content: "content 1",
    likeCount: 1,
    commentCount: 1,
  },
  {
    id: 2,
    author: "author 2",
    title: "title 2",
    content: "content 2",
    likeCount: 2,
    commentCount: 2,
  },
  {
    id: 3,
    author: "author 3",
    title: "title 3",
    content: "content 3",
    likeCount: 3,
    commentCount: 3,
  },
];

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) GET /posts
  //    모든 post를 다 가져온다.
  @Get()
  getPosts() {
    return posts;
  }

  // 2) GET /posts/:id
  //    id에 해당되는 post를 가져온다.
  @Get(":id")
  getPost(@Param("id") id: string) {
    const post = posts.find((post) => post.id === +id);

    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  // 3) POST /posts
  //    Post를 생성한다.
  @Post()
  postPosts(
    @Body("author") author: string,
    @Body("title") title: string,
    @Body("content") content: string,
  ) {
    const post: PostModel = {
      id: posts[posts.length - 1].id + 1,
      author,
      title,
      content,
      likeCount: 0,
      commentCount: 0,
    };

    posts = [...posts, post];

    return post;
  }

  // 4) PUT /posts/:id
  //    id에 해당되는 post를 변경한다.

  // 5) DELETE /posts/:id
  //    id에 해당되는 psot를 삭제한다.
}
