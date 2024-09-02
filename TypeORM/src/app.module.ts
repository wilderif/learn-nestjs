import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModel } from "./entity/user.entity";
import { StudentModel, TeacherModel } from "./entity/person.entity";
import {
  AirplaneModel,
  BookModel,
  CarModel,
  ComputerModel,
  SingleBaseModel,
} from "./entity/inheritance.entity";
import { ProfileModel } from "./entity/profile.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: "127.0.0.1",
        port: 5432,
        username: configService.get("POSTGRES_USER"),
        password: configService.get("POSTGRES_PASSWORD"),
        database: configService.get("POSTGRES_DB"),
        entities: [
          UserModel,
          StudentModel,
          TeacherModel,
          BookModel,
          CarModel,
          SingleBaseModel,
          ComputerModel,
          AirplaneModel,
          ProfileModel,
        ],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([UserModel, ProfileModel]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
