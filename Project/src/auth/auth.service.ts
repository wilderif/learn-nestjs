import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import { UsersModel } from "src/users/entities/users.entity";
import { HASH_ROUNDS, JWT_SECRET } from "./const/auth.const";
import { UsersService } from "src/users/users.service";
import * as bcrypt from "bcrypt";
import { RegisterUserDto } from "./dto/register-user.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 토큰을 사용하는 방식
   *
   * 1) 사용자가 로그인 또는 회원가입을 진행하면
   *    accessToken과 refreshToken을 발급받는다.
   * 2) 로그인 할 때는 Basic 토큰과 함꼐 요청을 보낸다.
   *    Basic 토큰은 "email:password"를 base64로 인코딩한 형태이다.
   *    ex) {authorization: 'Basic {token}'}
   * 3) 아무나 접근할 수 없는 정보 {private route}에 접근할 때는
   *    accessToken을 헤더에 추가해서 요청과 함께 보낸다.
   *    ex) {authorization: 'Bearer {token}'}
   * 4) 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해
   *    현재 요청을 보낸 사용자가 누구인지 알 수 있다.
   *    ex) 현재 로그인한 사용자가 작성한 포스트만 가져오려면
   *        토큰의 sub 값에 입력되어있는 사용자의 포스트만 따로 필터링할 수 있다.
   *        특정 사용자의 토큰이 없다면 다른 사용자의 데이터를 접근할 수 없다.
   * 5) 모든 토큰은 만료 기간이 있다. 만료 기간이 지나면 새로 토큰을 발급 받아야 한다.
   *    그렇지 않으면 jwtService.verify()에서 인증이 실패한다.
   *    그러니
   *    access 토큰을 새로 발급 받을 수 있는 /auth/token/access
   *    refresh 토큰을 새로 발급 받을 수 있는 /auth/token/refresh
   *    가 필요하다.
   * 6) 토큰이 만료되면 각각의 토큰을 새로 발급 받을 수 있는 endpoint에 요청을 해서,
   *    새로운 토큰을 발급 받고, 새로운 토큰을 사용하여 private route에 접근한다.
   */

  /**
   * Header로 부터 토큰을 받을 때,
   * {authorization: 'Basic {token}'}
   * {authorization: 'Bearer {token}'}
   */
  extractTokenFromHeader(header: string, isBearer: boolean) {
    const prefix = isBearer ? "Bearer" : "Basic";
    const splitToken = header.split(" ");

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException("Invalid token");
    }

    const token = splitToken[1];

    return token;
  }

  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, "base64").toString("utf-8");
    const split = decoded.split(":");

    if (split.length !== 2) {
      throw new UnauthorizedException("Invalid token");
    }

    const [email, password] = split;

    return { email, password };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: JWT_SECRET,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException("Token expired");
      } else {
        throw new UnauthorizedException("Invalid token");
      }
    }
  }

  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });

    // access token으로는 새로운 token 발급 받을 수 없다.
    if (decoded.type !== "refresh") {
      throw new UnauthorizedException("Refresh token required");
    }

    return this.signToken({ ...decoded }, isRefreshToken);
  }

  /**
   * 1) registerWithEmail
   *    - email, nickname, password를 입력받고 사용자를 생성한다.
   *    - 생성이 완료되면 accessToken과 refreshToken을 반환한다.
   *      (회원가입 후 다시 로그인할 필요 없도록)
   *
   * 2) loginWithEmail
   *    - email, password를 입력하면 사용자 검증을 진행한다.
   *    - 검증이 완료되면 accessToken과 refreshToken을 반환한다.
   *
   * 3) loginUser
   *    - (1)과 (2)에서 필요한 accessToken과 refreshToken을 반환하는 로직.
   *
   * 4) singnToken
   *    - (3)에서 필요한 accessToken과 refreshToken을 sign하는 로직.
   *
   * 5) authenticateWithEmailAndPassword
   *    - (2)에서 로그인을 진행할 때 필요한 기본적인 검증 진행.
   *      1. 사용자가 존재하는지 확인 (email)
   *      2. 비밀번호가 일치하는지 확인
   *      3. 사용자가 존재하고 비밀번호가 일치하면 사용자 정보를 반환
   *     (4. 반환된 데이터를 기반으로 loginWithEmail에서 토큰 생성)
   */

  /**
   * Payload에 들어갈 정보
   * 1) email
   * 2) sub (id)
   * 3) type : 'access' : 'refresh'
   */
  signToken(user: Pick<UsersModel, "email" | "id">, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: isRefreshToken ? "refresh" : "access",
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      // access token은 10분, refresh token은 1시간
      expiresIn: isRefreshToken ? 3600 : 600,
    });
  }

  loginUser(user: Pick<UsersModel, "email" | "id">) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, "email" | "password">,
  ) {
    const existingUser = await this.usersService.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException("User not found");
    }

    /**
     * bcrypt.compare parameter
     * 1) plainText : 사용자가 입력한 비밀번호
     * 2) hash : DB에 저장된 비밀번호
     * salt값은 bcrypt가 자동으로 처리?
     */
    const passOK = await bcrypt.compare(user.password, existingUser.password);

    if (!passOK) {
      throw new UnauthorizedException("Password not match");
    }

    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, "email" | "password">) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(existingUser);
  }

  async registerWithEmail(userDto: RegisterUserDto) {
    const hashedPassword = await bcrypt.hash(userDto.password, HASH_ROUNDS);

    // console.log(userDto);

    const newUser = await this.usersService.createUser({
      ...userDto,
      password: hashedPassword,
    });

    return this.loginUser(newUser);
  }
}
