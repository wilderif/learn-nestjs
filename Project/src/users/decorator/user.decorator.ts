import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from "@nestjs/common";
import { UsersModel } from "../entities/users.entity";

export const User = createParamDecorator(
  (data: keyof UsersModel | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    const user = req.user as UsersModel;

    if (!user) {
      throw new InternalServerErrorException(
        "Request does not contain user property. User decorator must be used with AccessTokenGuard.",
      );
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);
