import { NotFoundException } from "@nestjs/common";
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PaginationDto } from "../common/dtos/pagination.dto";
import { validate as isUUID } from "uuid";
import { ProductImage, Product } from "./entities";
import { User } from "src/auth/entities/user.entity";

@Injectable()
export class ProductsService {
  // identifica el error en processo de running
  private readonly logger = new Logger("ProductsService");

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      //  esto es síncrono asi que no usamos await, solo lo crea
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image })
        ),
        user
      });

      await this.productRepository.save(product); // lo guarda
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
        relations: {
          images: true,
        },
      });

      const simpleProducts = allProducts.map((product) => {
        return {
          ...product,
          images: product.images.map((image) => image.url),
        };
      });

      return simpleProducts;
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
        const queryBuilder = this.productRepository.createQueryBuilder("prod");

        findProduct = await queryBuilder
          .where(`upper(title) =:title or upper(slug) =:slug`, {
            title: option.toUpperCase(),
            slug: option.toLowerCase(),
          })
          .leftJoinAndSelect("prod.images", "prodImages")
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

  async findOnePlane(term: string) {
    const { images = [], ...rest } = await this.findOne(term);

    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      const product = await this.productRepository.preload({
        id: id,
        ...toUpdate,
      });

      if (!product) {
        throw new NotFoundException(`Product not found <<${id}>>`);
      }

      // ¡Create Query Runner!

      await queryRunner.connect();
      await queryRunner.startTransaction();

      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id: id } });
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image })
        );
      } else {
      }

      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return product;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
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
    console.log(error.message);
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

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder("product");

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
