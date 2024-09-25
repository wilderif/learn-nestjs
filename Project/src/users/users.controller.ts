import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseInterceptors,
} from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // @UseInterceptors(ClassSerializerInterceptor)
  /**
   * serialize(직렬화)
   * - 현재 시스템(NestJS)에서 사용되는 데이터의 구조를
   *   다른 시스템에서도 쉽게 사용할 수 있는 포맷으로 변환
   * - class의 object를 JSON 형태로 변환
   *
   * deserialize(역직렬화)
   * - JSON 형태로 변환된 데이터를 class의 object로 변환
   */
  getUsers() {
    return this.usersService.getAllUsers();
  }

  // @Post()
  // postUser(
  //   @Body("nickname") nickname: string,
  //   @Body("email") email: string,
  //   @Body("password") password: string,
  // ) {
  //   return this.usersService.createUser({
  //     nickname,
  //     email,
  //     password,
  //   });
  // }
}
