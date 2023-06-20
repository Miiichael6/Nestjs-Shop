import { createParamDecorator } from "@nestjs/common";
import { Request } from "express";


export const RawHeaders = createParamDecorator(
  (data, context) => {
    const req: Request = context.switchToHttp().getRequest()
    const rawHeaders = req.rawHeaders;

    return rawHeaders
})
