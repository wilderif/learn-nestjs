import { ValidationArguments } from "class-validator";

export const stringValidationMessage = (args: ValidationArguments) => {
  return `${args.targetName}'s ${args.property} must be a string`;
};
