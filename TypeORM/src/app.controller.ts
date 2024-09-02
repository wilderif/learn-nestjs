import { Controller, Get, Param, Post, Patch, Delete } from "@nestjs/common";
import { AppService } from "./app.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Role, UserModel } from "./entity/user.entity";
import { ILike, LessThan, MoreThanOrEqual, Repository } from "typeorm";
import { ProfileModel } from "./entity/profile.entity";
import { PostModel } from "./entity/post.entity";
import { TagModel } from "./entity/tag.entity";

@Controller()
export class AppController {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(ProfileModel)
    private readonly profileRepository: Repository<ProfileModel>,
    @InjectRepository(PostModel)
    private readonly postRepository: Repository<PostModel>,
    @InjectRepository(TagModel)
    private readonly tagRepository: Repository<TagModel>,
  ) {}

  @Get("users")
  getUsers() {
    return this.userRepository.find({
      select: {
        // id: true,
        // title: true,
        profile: {
          id: true,
        },
      },
      where: [
        {
          id: 1,
          verson: 2,
        },
        {
          verson: 1,
        },
      ],
      relations: {
        profile: true,
        posts: true,
      },
      order: {
        id: "ASC",
        verson: "DESC",
      },
      skip: 0,
      take: 3,
    });
  }

  @Post("sample")
  async sample() {
    // create
    const user1 = this.userRepository.create({
      email: "test@email.com",
    });

    // save
    const user2 = this.userRepository.save({
      email: "test@email.com",
    });

    // preload
    const user3 = await this.userRepository.preload({
      id: 1,
      email: "test@email.com",
    });

    // delete
    await this.userRepository.delete(5);

    // increment
    await this.userRepository.increment(
      {
        id: 4,
      },
      "count",
      2,
    );

    // decrement
    await this.userRepository.decrement(
      {
        id: 1,
      },
      "count",
      1,
    );

    // count
    const count = await this.userRepository.count({
      where: {
        email: ILike("%0%"),
      },
    });

    // sum
    const sum = await this.userRepository.sum("count", {
      id: LessThan(4),
    });

    // average
    const average = await this.userRepository.average("count", {
      id: LessThan(4),
    });

    // minimum
    const min = await this.userRepository.minimum("count", {
      id: LessThan(4),
    });

    // maximum
    const max = await this.userRepository.maximum("count", {
      id: LessThan(4),
    });

    const usersAndCount = await this.userRepository.findAndCount({
      take: 5,
    });

    return usersAndCount;
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

  @Post("posts/tags")
  async createPostsTags() {
    const post1 = await this.postRepository.save({
      title: "tag test 1",
    });

    const post2 = await this.postRepository.save({
      title: "tag test 2",
    });

    const tag1 = await this.tagRepository.save({
      name: "tag 1",
      posts: [post1, post2],
    });

    const tag2 = await this.tagRepository.save({
      name: "tag 2",
      posts: [post2],
    });

    const post3 = await this.postRepository.save({
      title: "tag test 3",
      tags: [tag1, tag2],
    });

    return true;
  }

  @Get("posts")
  getPost() {
    return this.postRepository.find({
      relations: {
        tags: true,
      },
    });
  }

  @Get("tags")
  getTags() {
    return this.tagRepository.find({
      relations: {
        posts: true,
      },
    });
  }

  @Delete("user/profile/:id")
  async deleteProfile(@Param("id") id: string) {
    return this.profileRepository.delete(+id);
  }
}
