import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from "typeorm";
import { ProfileModel } from "./profile.entity";
import { PostModel } from "./post.entity";

export enum Role {
  USER = "user",
  ADMIN = "admin",
}

@Entity()
export class UserModel {
  // @PrimaryGeneratedColumn()
  // @PrimaryColumn()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  // @Column({
  //   type: "varchar",
  //   name: "_title",
  //   length: 300,
  //   nullable: true,
  //   update: false,
  //   select: false,
  //   default: "defalut title",
  //   unique: false,
  // })
  // title: string;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  verson: number;

  @Column()
  // @Generated("increment")
  @Generated("uuid")
  additionalId: string;

  @OneToOne(() => ProfileModel, (profile) => profile.user, {
    // find() 실행 할 때, 항상 같이 가져올 relation
    eager: true,

    // 저장할 때, relation을 한 번에 같이 저장 가능
    cascade: false,

    nullable: true,

    onDelete: "SET NULL",
  })
  profile: ProfileModel;

  @OneToMany(() => PostModel, (post) => post.author)
  posts: PostModel[];

  @Column({ default: 0 })
  count: number;
}
