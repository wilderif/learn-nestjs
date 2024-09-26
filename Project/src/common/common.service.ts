import { Injectable } from "@nestjs/common";
import { BasePaginationDto } from "./dto/base-pagination.dto";
import { FindManyOptions, Repository } from "typeorm";
import { BaseModel } from "./entity/base.entity";

@Injectable()
export class CommonService {
  async paginate<T extends BaseModel>(
    basePaginationDto: BasePaginationDto,
    respository: Repository<T>,
    overideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    if (basePaginationDto.page) {
      return this.pagePaginate(
        basePaginationDto,
        respository,
        overideFindOptions,
      );
    } else {
      return this.cursorPaginate(
        basePaginationDto,
        respository,
        overideFindOptions,
        path,
      );
    }
  }

  private async pagePaginate<T extends BaseModel>(
    basePaginationDto: BasePaginationDto,
    respository: Repository<T>,
    overideFindOptions: FindManyOptions<T> = {},
  ) {}

  private async cursorPaginate<T extends BaseModel>(
    basePaginationDto: BasePaginationDto,
    respository: Repository<T>,
    overideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {}
}
