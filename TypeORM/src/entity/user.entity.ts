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

@Entity()
export class UserModel {
  // @PrimaryGeneratedColumn()
  // @PrimaryColumn()
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

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
