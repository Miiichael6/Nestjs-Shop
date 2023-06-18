import { join } from "path";
import { Injectable, BadRequestException } from "@nestjs/common";
import { existsSync } from "fs";

@Injectable()
export class FilesService {
  getStaticProductsImage(imageName: string) {
    const path = join(__dirname, "../../static/products", imageName);

    if(!existsSync(path)) {
      throw new BadRequestException(`Imagen no Existe ${imageName}`)
    }

    return path
  }
}
