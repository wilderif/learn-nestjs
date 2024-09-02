import { Controller, Get, Param, Post, Patch } from "@nestjs/common";
import { AppService } from "./app.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Role, UserModel } from "./entity/user.entity";
import { MoreThanOrEqual, Repository } from "typeorm";
import { ProfileModel } from "./entity/profile.entity";
import { PostModel } from "./entity/post.entity";

@Controller()
export class AppController {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(ProfileModel)
    private readonly profileRepository: Repository<ProfileModel>,
    @InjectRepository(PostModel)
    private readonly postRepository: Repository<PostModel>,
  ) {}

  @Get("users")
  getUsers() {
    return this.userRepository.find({
      // select: {
      //   // id: true,
      //   // title: true,
      // },
      relations: {
        profile: true,
        posts: true,
      },
    });
  }

  @Post("users")
  postUser() {
    return this.userRepository.save({
      // title: "test title"
      // role: Role.ADMIN,
    });
  }

  @Patch("users/:id")
  async patchUser(@Param("id") id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: parseInt(id),
      },
    });

    return this.userRepository.save({
      ...user,
      // title: user.title + "0",
    });
  }

  @Post("user/profile")
  async createUserAndProfile() {
    const user = await this.userRepository.save({
      email: "test@test.ai",
    });

    const profile = await this.profileRepository.save({
      profileImg: "asdf.png",
      user,
    });

    return user;
  }

  @Post("user/post")
  async createUserAndPosts() {
    const user = await this.userRepository.save({
      email: "test@test.ai",
    });

    await this.postRepository.save({
      author: user,
      title: "post 1",
    });

    await this.postRepository.save({
      author: user,
      title: "post 2",
    });

    return user;
  }
}
