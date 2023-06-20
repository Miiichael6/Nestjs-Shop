import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "./entities/user.entity";
import { CreateUserDto, LoginUserDto } from "./dto";
import { JwtPayload } from "./interfaces/jwt-payload.interface";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userReposity: Repository<User>,
    // nos lo proporciona en auth.module.ts JwtModule
    private readonly jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      // const {password} = createUserDto;

      // prepara la insersión
      const user = this.userReposity.create(createUserDto);

      // lo guarda en la base de datos
      await this.userReposity.save(user);

      delete user.password;

      return { 
        ...user, 
        token: this.getJwtToken({ id: user.id }) 
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    try {
      const user = await this.userReposity.findOne({
        where: { email: email },
        select: { email: true, password: true, id: true },
      });
      if (!user) {
        throw new UnauthorizedException("Not Valid Credentials");
      }

      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException("Not Valid Credentials");
      }

      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
      // return JWT
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private getJwtToken(payload: JwtPayload) {
    // usando el token
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error.code === "23505") {
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException(error.message);
  }
}
