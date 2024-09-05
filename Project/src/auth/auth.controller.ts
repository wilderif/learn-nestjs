import { Body, Controller, Post, Headers, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { MaxLengthPipe, MinLengthPipe } from "./pipe/password.pipe";
import { BasicTokenGuard } from "./guard/basic-token.guard";
import {
  AccessTokenGuard,
  RefreshTokenGuard,
} from "./guard/bearer-token.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("token/access")
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Headers("authorization") rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    const newToken = this.authService.rotateToken(token, false);

    // {accessToken: {token}}
    return { accessToken: newToken };
  }

  @Post("token/refresh")
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(@Headers("authorization") rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    const newToken = this.authService.rotateToken(token, true);

    // {accessToken: {token}}
    return { refreshToken: newToken };
  }

  @Post("login/email")
  @UseGuards(BasicTokenGuard)
  postLoginEmail(@Headers("authorization") rawToken: string) {
    // login할 때는 basic token을 사용한다. -> false
    // 이외의 경우에는 bearer token을 사용한다. -> true
    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const credentials = this.authService.decodeBasicToken(token);

    return this.authService.loginWithEmail(credentials);
  }

  @Post("register/email")
  postRegisterEmail(
    @Body("nickname") nickname: string,
    @Body("email") email: string,
    @Body("password", new MinLengthPipe(8), new MaxLengthPipe(20))
    password: string,
  ) {
    return this.authService.registerWithEmail({ nickname, email, password });
  }
}
