import { PickType } from "@nestjs/mapped-types";
import { PostsModel } from "../entities/posts.entity";
import { IsString, Length } from "class-validator";
import { stringValidationMessage } from "src/common/validation-mesage/string-validation.message";

// DTO - Data Transfer Object
export class CreatePostDto extends PickType(PostsModel, ["title", "content"]) {
  @IsString({
    message: stringValidationMessage,
  })
  title: string;

  @IsString({
    message: stringValidationMessage,
  })
  content: string;
}
