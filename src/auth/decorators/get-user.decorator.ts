import { createParamDecorator, InternalServerErrorException } from "@nestjs/common";

// Custom Decorator
export const GetUser = createParamDecorator(
  (data, context ) => {
    const req = context.switchToHttp().getRequest()
    const user = req.user;
    
    if(!user) throw new InternalServerErrorException("User not found (request)")

    if(data === "email"){
      return user.email
    }
    
    return user;
})