import { PickType } from "@nestjs/mapped-types";
import { Exclude } from "class-transformer";
import { IsEmail, IsString, Length } from "class-validator";
import { emailValidationMessage } from "src/common/validation-mesage/email-validation.message";
import { lengthValidationMessage } from "src/common/validation-mesage/length-validation.message";
import { stringValidationMessage } from "src/common/validation-mesage/string-validation.message";
import { UsersModel } from "src/users/entities/users.entity";

export class RegisterUserDto extends PickType(UsersModel, [
  "nickname",
  "email",
  "password",
]) {
  @IsString({
    message: stringValidationMessage,
  })
  @Length(1, 20, {
    message: lengthValidationMessage,
  })
  nickname: string;

  @IsEmail(
    {},
    {
      message: emailValidationMessage,
    },
  )
  email: string;

  @IsString({
    message: stringValidationMessage,
  })
  @Length(8, 20, {
    message: lengthValidationMessage,
  })
  // @Exclude()
  password: string;
}
