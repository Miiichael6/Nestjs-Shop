import { ValidationPipe, Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function main() {
  const app = await NestFactory.create(AppModule);
  // const logger = new Logger("main");

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
  await app.listen(process.env.PORT);
  console.log(`running at port http://localhost:${process.env.PORT}`)
  // logger.log(`http://localhost:${process.env.PORT}`);
}
main();
