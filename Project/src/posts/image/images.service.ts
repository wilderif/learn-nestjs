import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { basename, join } from "path";
import {
  POST_IMAGE_PATH,
  TEMP_DIRECTORY_PATH,
} from "src/common/const/path.const";
import { ImageModel } from "src/common/entity/image.entity";
import { QueryRunner, Repository } from "typeorm";
import { CreatePostImageDto } from "./dto/create-image.dto";
import { promises } from "fs";

@Injectable()
export class PostsImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}

  getRepository(queryRunner?: QueryRunner) {
    return queryRunner
      ? queryRunner.manager.getRepository<ImageModel>(ImageModel)
      : this.imageRepository;
  }

  async createPostImage(dto: CreatePostImageDto, queryRunner?: QueryRunner) {
    const repository = this.getRepository(queryRunner);

    // dto의 image 이름을 기반으로 파일의 경로를 생성한다.
    const tempFilePath = join(TEMP_DIRECTORY_PATH, dto.path);

    try {
      // 파일이 존재하는지 확인
      // 파일이 존재하지 않는다면 에러를 던짐
      await promises.access(tempFilePath);
    } catch (error) {
      throw new BadRequestException("File not exists");
    }

    // 파일의 이름만 가져오기
    // /temp/xxx.png -> xxx.png
    const fileName = basename(tempFilePath);

    // 새로 이동할 포스트 폴더의 경로 + 이미지 이름
    // {프로젝트 경로}/public/posts/xxx.png
    const newPath = join(POST_IMAGE_PATH, fileName);

    // DB에 저장
    const result = await repository.save({
      ...dto,
    });

    // 파일을 이동
    await promises.rename(tempFilePath, newPath);

    return result;
  }
}
