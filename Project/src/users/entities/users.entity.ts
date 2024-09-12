import { Entity, Column, OneToMany } from "typeorm";
import { RolesEnum } from "../const/roles.const";
import { PostsModel } from "src/posts/entities/posts.entity";
import { BaseModel } from "src/common/entity/base.entity";
import { Exclude } from "class-transformer";

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20,
    unique: true,
  })
  nickname: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  @Exclude({
    // 응담(Response) 시에 password를 제외하고 보내줌
    toPlainOnly: true,
  })
  /**
   * Request
   * frontend -> backend
   * plain object (JSON) -> class instance (DTO)
   *
   * Response
   * backend -> frontend
   * class instance (DTO) -> plain object (JSON)
   *
   * toClassOnly
   * plain object -> class instance
   * Request시에 적용
   *
   * toPlainOnly
   * class instance -> plain object
   * Response시에 적용
   */
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];
}
