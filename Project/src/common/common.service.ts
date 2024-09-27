import { BadRequestException, Injectable } from "@nestjs/common";
import { BasePaginationDto } from "./dto/base-pagination.dto";
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from "typeorm";
import { BaseModel } from "./entity/base.entity";
import { FILTER_MAPPER } from "./const/filter-mapper.const";

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

  /**
   * DTO의 구조
   * {
   *   where__id__more_than: number;
   *   order__createdAt: "ASC" | "DESC";
   * }
   *
   * where__id__more_than, where__likeCount__more_than, where__title__ilike
   * 등 모든 where filter를 파싱할 수 있어야 함
   *
   * 1) where로 시작한다면 filter 로직을 적용한다.
   * 2) order로 시작한다면 order 로직을 적용한다.
   * 3) Filter 로직을 적용하는 경우, '__' 기준으로 split 했을 때,
   *   3개의 값으로 나뉘는지 2개의 값으로 나뉘는지 확인한다.
   *   3-1) 3개의 값으로 나뉜다면, FILTER_MAPPER에서 해당되는 operator 함수를 찾아서 적용한다.
   *        ["where", "id", "more_than"]
   *   3-2) 2개의 값으로 나뉜다면, 정확한 값을 Fiter하는 것이기 때문에 operator 없이 적용한다.
   *        ["where", "id"]
   * 4) order의 경우 3-2)와 같은 방식으로 적용한다.
   *
   * return {
   *   where,
   *   order,
   *   take,
   *   skip -> page 기반일 때만
   * }
   */
  private composeFindOptions<T extends BaseModel>(
    basePaginationDto: BasePaginationDto,
  ) {
    let where: FindManyOptions<T> = {};
    let order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(basePaginationDto)) {
      if (key.startsWith("where")) {
        where = {
          ...where,
          ...this.parseWhereFilter<T>(key, value),
        };
      } else if (key.startsWith("order")) {
        order = {
          ...order,
          ...this.parseOrderFilter<T>(key, value),
        };
      }
    }

    return {
      where,
      order,
      take: basePaginationDto.take,
      skip: basePaginationDto.page
        ? (basePaginationDto.page - 1) * basePaginationDto.take
        : null,
    };
  }

  private parseWhereFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsWhere<T> {
    const options: FindOptionsWhere<T> = {};

    const splitKey = key.split("__");
    if (splitKey.length === 2) {
      const [_, field] = splitKey;
      options[field] = value;
    } else if (splitKey.length === 3) {
      /**
       * 길이가 3인 경우에는 TypeORM utility 존재하는 경우이다.
       *
       * where__id__more_than의 경우,
       * 두 번째 값이 필터할 키값, 세 번째 값은 typeORM utility 함수이다.
       *
       * FILTER_MAPPER에 미리 정의해둔 값들로
       * field 값에 FILTER_MAPPER에서 해당되는 utility를 가져온 후 값에 적용한다.
       */
      const [_, field, operator] = splitKey;

      // where__id__between = 3,4
      // 만약 , 없이 하나의 값만 사용하는 경우 길이가 1
      const values = value.toString().split(",");

      options[field] = FILTER_MAPPER[operator](...values);
    } else {
      throw new BadRequestException("where filter key is invalid : " + key);
    }

    return options;
  }

  private parseOrderFilter<T extends BaseModel>(
    key: string,
    value: any,
  ): FindOptionsOrder<T> {}
}
