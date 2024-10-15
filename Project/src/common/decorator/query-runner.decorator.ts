import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from "@nestjs/common";

export const QueryRunnerDecorator = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!request.queryRunner) {
      throw new InternalServerErrorException(
        "To use QueryRunner, use TransactionInterceptor",
      );
    }

    return request.queryRunner;
  },
);
