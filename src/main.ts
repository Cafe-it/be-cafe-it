import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { RequestValidationPipe } from "./common/pipes/RequestValidationPipe";
import { ClassSerializerInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "./common/config";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

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

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Environment: ${nodeEnv}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
