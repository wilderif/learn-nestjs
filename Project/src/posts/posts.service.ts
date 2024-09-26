import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, LessThan, MoreThan, Repository } from "typeorm";
import { PostsModel } from "./entities/posts.entity";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { PaginatePostDto } from "./dto/paginate-post.dto";
import { HOST, PROTOCOL } from "src/common/const/env.const";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}

  async getAllPosts() {
    return this.postsRepository.find({
      relations: ["author"],
    });
  }

  async generateDummyPosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `dummy post ${i}`,
        content: `dummy content ${i}`,
      });
    }
  }

  async paginatePosts(paginatePostDto: PaginatePostDto) {
    if (paginatePostDto.page) {
      return this.pagePaginatePosts(paginatePostDto);
    } else {
      return this.cursorPaginatePosts(paginatePostDto);
    }
  }

  /**
   * Response
   *
   * data: Data[],
   * total: 전체 데이터의 개수,
   */
  async pagePaginatePosts(paginatePostDto: PaginatePostDto) {
    const [posts, count] = await this.postsRepository.findAndCount({
      order: {
        createAt: paginatePostDto.order__createdAt,
      },
      take: paginatePostDto.take,
      skip: paginatePostDto.take * (paginatePostDto.page - 1),
    });

    return {
      data: posts,
      total: count,
    };
  }

  /**
   * Response
   *
   * data: Data[],
   * cursor: {
   *  after: 마지막 data의 ID,
   * },
   * count: 응답한 data의 개수,
   * next: 다음 요청을 할 때 사용할 URL
   */
  async cursorPaginatePosts(paginatePostDto: PaginatePostDto) {
    const where: FindOptionsWhere<PostsModel> = {};

    if (paginatePostDto.where__id__less_than) {
      /**
       * {
       *  id: LessThan(paginatePostDto.where__id_less_than),
       * }
       */
      where.id = LessThan(paginatePostDto.where__id__less_than);
    } else if (paginatePostDto.where__id__more_than) {
      /**
       * {
       *  id: MoreThan(paginatePostDto.where__id_more_than),
       * }
       */
      where.id = MoreThan(paginatePostDto.where__id__more_than);
    }

    const posts = await this.postsRepository.find({
      where,
      order: {
        createAt: paginatePostDto.order__createdAt,
      },
      take: paginatePostDto.take,
    });

    // 해당되는 포스트가 0개 이상이면 마지막 포스트를 가져오고
    // 아니면 null을 반환
    const lastItem =
      posts.length > 0 && posts.length === paginatePostDto.take
        ? posts[posts.length - 1]
        : null;

    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/posts`);

    /**
     * DTO의 키값들을 순회하며
     * 키값에 해당되는 밸류가 존재하면 param에 그대로 붙여준다.
     * 단, where__id_more_than 값만 lastItem의 마지막 값으로 넣어준다.
     */
    if (nextUrl) {
      for (const key of Object.keys(paginatePostDto)) {
        if (paginatePostDto[key]) {
          if (key !== "where__id_more_than" && key !== "where__id_less_than") {
            nextUrl.searchParams.append(key, paginatePostDto[key]);
          }
        }
      }

      let key = null;

      if (paginatePostDto.order__createdAt === "ASC") {
        key = "where__id_more_than";
      } else {
        key = "where__id_less_than";
      }
      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data: posts,
      cursor: {
        after: lastItem?.id ?? null,
      },
      count: posts.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  async getPostById(postId: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
      relations: ["author"],
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async createPost(authorId: number, postDto: CreatePostDto) {
    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      likeCount: 0,
      commentCount: 0,
    });

    // console.log(postDto);
    // console.log(post);

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async updatePost(postId: number, postDto: UpdatePostDto) {
    const { title, content } = postDto;

    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async deletePost(postId: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    await this.postsRepository.delete(postId);

    return postId;
  }
}
