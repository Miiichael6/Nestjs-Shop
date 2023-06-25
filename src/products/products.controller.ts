import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ParseUUIDPipe } from "@nestjs/common";
import { PaginationDto } from "../common/dtos/pagination.dto";
import { Auth } from "src/auth/decorators/auth.decorator";
import { ValidRoles } from "src/auth/interfaces";
import { GetUser } from "src/auth/decorators/get-user.decorator";
import { User } from "src/auth/entities/user.entity";
import { Product } from "./entities";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth()
  @ApiResponse({
    status: 201,
    description: "Product was created",
    type: Product,
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 403, description: "Forbidden, Token related" })
  create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
    return this.productsService.create(createProductDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOnePlane(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Auth(ValidRoles.admin)
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
