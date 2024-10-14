import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { map, Observable, tap } from "rxjs";

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    /**
     * 요청이 들어올 때 REQ 요청이 들어온 타임스탬프를 찍는다.
     * [REQ] {request path} {timestamp}
     *
     * 요청이 끝날 때 (응답이 나갈 때) 다시 타임스탬프를 찍는다.
     * [RES] {request path} {timestamp} {duration (ms)}
     */

    const requestTime = new Date();
    const req = context.switchToHttp().getRequest();

    // /posts
    // /common/image
    const path = req.originalUrl;

    // [REQ] {request path} {timestamp}
    console.log(`[REQ] ${path} ${requestTime.toLocaleString("kr")}`);

    // return next.handle()을 실행하는 순간
    // route의 로직이 전부 실행되고 응답이 observable로 반환된다.
    // observable = 응답
    // (윗 부분은 로직이 실행되기 전)
    // pipe() 내부에 'rxjs' 기능 사용 가능?
    return next.handle().pipe(
      // tap()은 observable을 관찰할 때 사용
      tap((observable) => {
        const responseTime = new Date();
        console.log(
          `[RES] ${path} ${responseTime.toLocaleString("kr")} ${responseTime.getMilliseconds() - requestTime.getMilliseconds()}ms`,
        );
      }),
      // // map()은 observable을 변환할 때 사용
      // map((observable) => {
      //   return {
      //     message: "hello",
      //     response: observable,
      //   };
      // }),
      // tap((observable) => {
      //   console.log("after map");
      //   console.log(observable);
      // }),
    );
  }
}
