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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userReposity: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      // const {password} = createUserDto;

      const user = this.userReposity.create(createUserDto);

      await this.userReposity.save(user);

      delete user.password;

      return user;
      // Retornar JWT de acceso
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    try {
      const user = await this.userReposity.findOne({
        where: { email: email },
        select: { email: true, password: true },
      });
      if (!user) {
        throw new UnauthorizedException("Not Valid Credentials");
      }

      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException("Not Valid Credentials");
      }

      return user;
      // return JWT
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private handleDBErrors(error: any): never {
    if (error.code === "23505") {
      throw new BadRequestException(error.detail);
    }
    console.log(error);

    throw new InternalServerErrorException(error.message);
  }
}
