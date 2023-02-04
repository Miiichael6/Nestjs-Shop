import { NotFoundException } from "@nestjs/common";
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import { PaginationDto } from "../common/dtos/pagination.dto";
import { validate as isUUID } from "uuid";

@Injectable()
export class ProductsService {
  // identifica el error en processo de running
  private readonly logger = new Logger("ProductsService");

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      //  esto es síncrono asi que no usamos await, solo lo crea
      const product = this.productRepository.create(createProductDto);

      await this.productRepository.save(product); // lo guarda

      console.log(product);
      return product;
    } catch (error: any) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;

      const allProducts = await this.productRepository.find({
        take: limit,
        skip: offset,
        // TODO: Relaciones
      });

      return allProducts;
    } catch (error: any) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(option: string) {
    try {
      let findProduct: Product;

      if (isUUID(option)) {
        findProduct = await this.productRepository.findOneBy({ id: option });
      } else {
        const queryBuilder = this.productRepository.createQueryBuilder();

        findProduct = await queryBuilder
          .where(`upper(title) =:title or upper(slug) =:slug`, {
            title: option.toUpperCase(),
            slug: option.toLowerCase(),
          })
          .getOne();
      }

      if (!findProduct) {
        throw new NotFoundException(`Producto no encontrado`);
      }

      return findProduct;
    } catch (error: any) {
      this.handleDBExceptions(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productRepository.preload({
        id: id,
        ...updateProductDto,
      });

      if (!product) {
        throw new NotFoundException(`Product not found <<${id}>>`);
      }

      const productUpdated = await this.productRepository.save(product);

      return productUpdated;
    } catch (error: any) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });

    if (product) {
      await this.productRepository.remove(product);
    } else {
      throw new NotFoundException();
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === "23505") {
      throw new InternalServerErrorException(error.detail);
    }
    if (error.code === "23502") {
      throw new InternalServerErrorException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException(
      `Error atrapado check logs, detalles: "${error.message}"`
    );
  }
}
