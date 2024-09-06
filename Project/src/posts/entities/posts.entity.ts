import { IsString } from "class-validator";
import { BaseModel } from "src/common/entity/base.entity";
import { UsersModel } from "src/users/entities/users.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class PostsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
  })
  author: UsersModel;

  @Column()
  @IsString({
    message: "Custom: Title must be a string",
  })
  title: string;

  @Column()
  @IsString({
    message: "Custom: Content must be a string",
  })
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
