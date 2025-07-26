import { NestFactory } from "@nestjs/core";
import { ClassSerializerInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { RequestValidationPipe } from "./common/pipes/RequestValidationPipe";
import { AppConfig } from "./common/config";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { WinstonLoggerService } from "./common/services";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Initialize custom logger
  const loggerService = await app.resolve(WinstonLoggerService);
  loggerService.setContext("Bootstrap");
  app.useLogger(loggerService);

  // Get configuration
  const appConfig = configService.get<AppConfig>("app");
  const { port, nodeEnv, apiPrefix } = appConfig;

  // Global exception filter with Winston logger
  const exceptionFilter = new GlobalExceptionFilter(loggerService);
  app.useGlobalFilters(exceptionFilter);

  // Global pipes and interceptors
  app.useGlobalPipes(new RequestValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.setGlobalPrefix(apiPrefix);

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle("Cafe IT API")
    .setDescription("API for managing cafes and seat availability")
    .setVersion("1.0")
    .addTag("auth", "Authentication endpoints")
    .addTag("owners", "Owner management endpoints")
    .addTag("cafes", "Cafe management endpoints")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth"
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);

  // Use the logger service for startup messages
  loggerService.log(`Application is running on: http://localhost:${port}`);
  loggerService.log(`Environment: ${nodeEnv}`);
  loggerService.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
