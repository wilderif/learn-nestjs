import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { get } from "http";

interface Post {
  author: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
}

@Controller("post")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("post")
  getPost(): Post {
    return {
      author: "Test",
      title: "Test Title",
      content: "Test Content",
      likeCount: 1,
      commentCount: 2,
    };
  }
}
