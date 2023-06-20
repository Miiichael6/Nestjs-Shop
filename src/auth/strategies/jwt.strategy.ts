import { UnauthorizedException, Injectable } from '@nestjs/common';
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { User } from "../entities/user.entity";

@Injectable() // es un provider asi que su decorador es Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    // injeción de repository para buscar la data enviada en jwt
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // ConfigService para poder acceder a las variables de entorno
    configService: ConfigService
  ) {
    // se llama al contructor del padre para poder
    // completar la config de JWT
    super({
      secretOrKey: configService.get("JWT_SECRET"),

      // ponemos en que posición esperamos que nos mande el JWT
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException("Token not valid");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("User inactive");
    }

    // si todo está perfecto, 
    // el usuario se añadirá a la request(Req)
    return user;
  }
}
