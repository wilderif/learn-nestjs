import { PartialType } from "@nestjs/mapped-types";
import { PostsModel } from "../entities/posts.entity";
import { IsOptional, IsString } from "class-validator";
import { CreatePostDto } from "./create-post.dto";

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;
}
