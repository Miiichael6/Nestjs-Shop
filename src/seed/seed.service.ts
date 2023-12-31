import { Injectable } from "@nestjs/common";
import { ProductsService } from "../products/products.service";
import { initialData } from "./data/seed-data";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/auth/entities/user.entity";

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly productService: ProductsService
  ) {}

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers()
    await this.insertNewProducts(adminUser);

    return "executed";
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    
    const users: User[] = []

    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user))
    })
    
    const usersDb = await this.userRepository.save(seedUsers)

    return usersDb[0]
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();

    await queryBuilder.delete().where({}).execute();
  }

  private async insertNewProducts(user: User) {
    await this.productService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productService.create(product, user));
    });

    await Promise.all(insertPromises);

    return true;
  }
}
