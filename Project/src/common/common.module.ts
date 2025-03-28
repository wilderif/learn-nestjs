import { BadRequestException, Module } from "@nestjs/common";
import { CommonService } from "./common.service";
import { CommonController } from "./common.controller";
import { MulterModule } from "@nestjs/platform-express";
import { extname } from "path";
import * as multer from "multer";
import { TEMP_DIRECTORY_PATH } from "./const/path.const";
import { v4 as uuid } from "uuid";
import { AuthModule } from "src/auth/auth.module";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [
    MulterModule.register({
      limits: {
        // byte 단위로 입력
        fileSize: 10 * 1000 * 1000, // 10MB
      },
      fileFilter: (req, file, cb) => {
        /**
         * cb(error, boolean)
         * error: 에러가 발생했을 때 에러 객체를 전달
         * boolean: 파일을 허용할 것인지에 대한 여부를 전달
         */

        // xxx.png -> .png
        const ext = extname(file.originalname);

        console.log("In Multer");

        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
          return cb(
            new BadRequestException("Only jpg, jpeg, png files are allowed"),
            false,
          );
        }

        return cb(null, true);
      },
      storage: multer.diskStorage({
        destination: (req, res, cb) => {
          cb(null, TEMP_DIRECTORY_PATH);
        },
        filename: (req, file, cb) => {
          cb(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
