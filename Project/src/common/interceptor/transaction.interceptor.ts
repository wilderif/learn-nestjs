import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from "@nestjs/common";
import { catchError, Observable, tap } from "rxjs";
import { DataSource } from "typeorm";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    // transaction과 관련된 모든 쿼리를 담당할 queryRunner를 생성한다.
    const queryRunner = this.dataSource.createQueryRunner();

    // queryRunner에 연결한다.
    await queryRunner.connect();

    // transaction을 시작한다.
    // 이 시점부터 같은 queryRunner를 사용하면,
    // transaction 안에서 database action을 실행할 수 있다.
    await queryRunner.startTransaction();

    request.queryRunner = queryRunner;

    return next.handle().pipe(
      // transaction 실행 중 에러가 발생할 때, rollback
      catchError(async (error) => {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();

        throw new InternalServerErrorException(
          "Error while creating post",
          error.message,
        );
      }),
      // transaction 실행 중 에러가 발생하지 않았을 때, commit
      tap(async () => {
        await queryRunner.commitTransaction();
        await queryRunner.release();
      }),
    );
  }
}
