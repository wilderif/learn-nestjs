import { IsIn, IsNumber, IsOptional } from "class-validator";

export class BasePaginationDto {
  @IsNumber()
  @IsOptional()
  page?: number;

  // 이전 마지막 데이터의 ID
  // 이 property에 입력된 ID보다 큰 ID를 가진 데이터를 가져오기
  // transformOptions: { enableImplicitConversion: true }를 통하여
  // 변환 과정을 거치지 않고 숫자로 변환
  // @Type(() => Number)
  @IsNumber()
  @IsOptional()
  where__id__more_than?: number;

  @IsNumber()
  @IsOptional()
  where__id__less_than?: number;

  // 정렬
  // createdAt -> 생성된 시간의 오름차/내림차 순으로 정렬
  @IsIn(["ASC", "DESC"])
  @IsOptional()
  order__createdAt: "ASC" | "DESC" = "ASC";

  // 몇 개의 데이터를 응답으로 받을지
  @IsNumber()
  @IsOptional()
  take: number = 20;
}
