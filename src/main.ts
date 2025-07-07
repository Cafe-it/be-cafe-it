import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { RequestValidationPipe } from "./common/pipes/RequestValidationPipe";
import { ClassSerializerInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "./common/config";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Get configuration
  const appConfig = configService.get<AppConfig>("app");
  const { port, nodeEnv, apiPrefix } = appConfig;

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global pipes and interceptors
  app.useGlobalPipes(new RequestValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.setGlobalPrefix(apiPrefix);

  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Environment: ${nodeEnv}`);
}

bootstrap();
