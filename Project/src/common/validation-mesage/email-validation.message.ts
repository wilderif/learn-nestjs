import { ValidationArguments } from "class-validator";

export const emailValidationMessage = (args: ValidationArguments) => {
  return `${args.targetName}'s ${args.property} must be an email`;
};
