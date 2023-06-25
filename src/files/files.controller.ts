import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Param,
  Res,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { FilesService } from "./files.service";
import { fileFilterFunct } from "./helpers/fileFilter.helper";
import { fileNamer } from "./helpers/fileNamer.helper";
import { Get } from "@nestjs/common";
import { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Files")
@Controller("files")
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly ConfigService: ConfigService
  ) {}

  @Get("product/:imageName")
  findProductImage(
    @Res() res: Response,
    @Param("imageName") imageName: string
  ) {
    const path = this.filesService.getStaticProductsImage(imageName);

    res.sendFile(path);
  }

  @Post("product")
  @UseInterceptors(
    FileInterceptor("file", {
      fileFilter: fileFilterFunct,
      // limits: { fileSize: 100 },
      storage: diskStorage({
        destination: "./static/products",
        filename: fileNamer,
      }),
    })
  )
  uploadProductImage(
    @UploadedFile()
    file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException(
        "asegurate de que el archivo es una imagen"
      );
    }

    const secureURL = `${this.ConfigService.get("HOST_API")}/files/product/${
      file.filename
    }`;

    return {
      secureURL,
    };
  }
}
