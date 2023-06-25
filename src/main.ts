import { ValidationPipe, Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function main() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("main");

  app.setGlobalPrefix("api"); // prefij o /api

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // transform: true,
      // transformOptions: {
      //   enableImplicitConversion: true,
      // }
    })
  );

  const config = new DocumentBuilder()
  .setTitle('Shop RestApi')
  .setDescription('My Shop endpoints')
  .setVersion('1.0')
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);



  await app.listen(process.env.PORT);
  // console.log(`running at port http://localhost:${process.env.PORT}/api`)
  logger.log(`http://localhost:${process.env.PORT}/api`);
}
main();
