import { IsString } from "class-validator";

// DTO - Data Transfer Object
export class CreatePostDto {
  @IsString()
  title: string;

  @IsString()
  content: string;
}
