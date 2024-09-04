import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  Injectable,
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

@Injectable()
export class MaxLengthPipe implements PipeTransform {
  constructor(private readonly maxLength: number) {}

  transform(value: any, metadata: ArgumentMetadata): string {
    value = value.toString();

    if (value.length > this.maxLength) {
      throw new BadRequestException(
        `The maximum length of the value is ${this.maxLength}`,
      );
    }

    return value;
  }
}

@Injectable()
export class MinLengthPipe implements PipeTransform {
  constructor(private readonly minLength: number) {}

  transform(value: any, metadata: ArgumentMetadata): string {
    value = value.toString();

    if (value.length < this.minLength) {
      throw new BadRequestException(
        `The minimum length of the value is ${this.minLength}`,
      );
    }

    return value;
  }
}
