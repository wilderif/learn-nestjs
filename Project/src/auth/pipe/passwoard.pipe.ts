import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";

@Injectable()
export class PasswordPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): string {
    value = value.toString();

    if (value.length < 8 || value.length > 20) {
      throw new BadRequestException(
        "Password must be between 8 and 20 characters",
      );
    }

    return value;
  }
}
