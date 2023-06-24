import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto, LoginUserDto } from "./dto";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "./decorators/get-user.decorator";
import { User } from "./entities/user.entity";
import { RawHeaders } from "./decorators/raw-headers.decorator";
import { UserRoleGuard } from "./guards/user-role/user-role.guard";
import { RoleProtected } from "./decorators/role-protected.decorator";
import { ValidRoles } from "./interfaces";
import { Auth } from './decorators/auth.decorator';
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post("login")
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get("check-status")
  //! User Autenticado
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user)
  }

  @Get("private")
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    // @Req() request: Express.Request
    @GetUser() user: User,
    @GetUser("email") userEmail: string,
    @RawHeaders() rawHeaders: string[]
  ) {
    return {
      ok: true,
      user,
      userEmail,
      rawHeaders,
    };
  }

  // @SetMetadata('roles', ["admin", "super-user"])

  @Get("private2")
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin, ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user: user,
    };
  }

  @Get("private3")
  @Auth()
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user: user,
    };
  }
}
