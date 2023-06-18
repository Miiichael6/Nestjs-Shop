import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsModule } from "./products/products.module";
import { CommonModule } from "./common/common.module";
import { SeedModule } from "./seed/seed.module";
import { FilesModule } from "./files/files.module";
// import { serveStaticProviders } from "@nestjs/serve-static";
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT), // should be a number
      database: process.env.DB_NAME, // database name
      username: process.env.DB_USERNAME, // database username
      password: process.env.DB_PASS, // password of the database
      autoLoadEntities: true, // it's very important
      synchronize: true, // more important, syncronize the database
    }),

    // serveStaticProviders.forRoot({
    //   rootPath: join(__dirname, "..", "public"),
    // }),

    CommonModule,
    ProductsModule, 
    SeedModule,
    FilesModule,
    AuthModule,
  ],
})
export class AppModule {}