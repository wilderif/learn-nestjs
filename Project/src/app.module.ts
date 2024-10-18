import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PostsModule } from "./posts/posts.module";
import { PostsModel } from "./posts/entities/posts.entity";
import { UsersModule } from "./users/users.module";
import { UsersModel } from "./users/entities/users.entity";
import { AuthModule } from "./auth/auth.module";
import { CommonModule } from "./common/common.module";
import { APP_INTERCEPTOR } from "@nestjs/core";
import {
  ENV_DB_DATABASE_KEY,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME_KEY,
} from "./common/const/env-keys.const";
import { ServeStaticModule } from "@nestjs/serve-static";
import { PUBLIC_DIRECTORY_PATH } from "./common/const/path.const";
import { ImageModel } from "./common/entity/image.entity";
import { LogMiddleware } from "./common/middleware/log.middleware";
import { ChatsModule } from './chats/chats.module';

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
        host: configService.get<string>(ENV_DB_HOST_KEY),
        port: parseInt(configService.get<string>(ENV_DB_PORT_KEY)),
        username: configService.get<string>(ENV_DB_USERNAME_KEY),
        password: configService.get<string>(ENV_DB_PASSWORD_KEY),
        database: configService.get<string>(ENV_DB_DATABASE_KEY),
        entities: [PostsModel, UsersModel, ImageModel],
        synchronize: true,
      }),
    }),
    ServeStaticModule.forRoot({
      // serveRoot를 활용하여
      // http://localhost:3000/xxx.png -> http://localhost:3000/public/xxx.png
      rootPath: PUBLIC_DIRECTORY_PATH,
      serveRoot: "/public",
    }),
    PostsModule,
    UsersModule,
    AuthModule,
    CommonModule,
    ChatsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes({
      path: "*",
      method: RequestMethod.ALL,
    });
  }
}
