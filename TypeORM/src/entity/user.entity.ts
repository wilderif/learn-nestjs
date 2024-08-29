import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from "typeorm";

export enum Role {
  USER = "user",
  ADMIN = "admin",
}

@Entity()
export class UserModel {
  // @PrimaryGeneratedColumn()
  // @PrimaryColumn()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    name: "_title",
    length: 300,
    nullable: true,
    update: false,
    select: false,
    default: "defalut title",
    unique: false,
  })
  title: string;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  verson: number;

  @Column()
  // @Generated("increment")
  @Generated("uuid")
  additionalId: string;
}
