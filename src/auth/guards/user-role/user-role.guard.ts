import { Reflector } from "@nestjs/core";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException
} from "@nestjs/common";
import { Observable } from "rxjs";
import { User } from "src/auth/entities/user.entity";
import { META_ROLES } from "src/auth/decorators/role-protected.decorator";

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler()
    );


    // console.log({ validRoles });

    const req = context.switchToHttp().getRequest();
    const user: User = req.user;

    if (!user) {
      throw new BadRequestException("No User found");
    }

    for (const role of user.roles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }

    throw new ForbiddenException(
      `User ${user.fullname} needs a valid role: [${validRoles}]`
    )
  }
}
