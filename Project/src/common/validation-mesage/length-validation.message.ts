import { ValidationArguments } from "class-validator";

export const lengthValidationMessage = (args: ValidationArguments) => {
  /**
   * ValidationArguments의 property들
   *
   * 1) value : 검증 대상 값(입력된 값)
   * 2) constraints : parameter에 입력된 제약 조건
   *    args.constraints[0] : 8
   *    args.constraints[1] : 20
   * 3) targetName : 검증하고 있는 class의 이름
   * 4) object : 검증하고 있는 객체
   * 5) property : 검증하고 있는 객체의 property 이름
   */
  if (args.constraints.length === 2) {
    return `${args.targetName}'s ${args.property} must be between ${args.constraints[0]} and ${args.constraints[1]} characters`;
  } else {
    return `${args.targetName}'s ${args.property} must be longer than ${args.constraints[0]} characters`;
  }
};
