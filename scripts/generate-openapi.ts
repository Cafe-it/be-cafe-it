import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

import { ClassSerializerInterceptor } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory, Reflector } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "../src/app.module";
import { AppConfig } from "../src/common/config";
import { GlobalExceptionFilter } from "../src/common/filters/global-exception.filter";
import { RequestValidationPipe } from "../src/common/pipes/RequestValidationPipe";
import { WinstonLoggerService } from "../src/common/services";

async function generateOpenAPI() {
  console.log("🚀 Starting OpenAPI generation...");

  try {
    // Create NestJS application context without starting the server
    const app = await NestFactory.create(AppModule, { logger: false });
    const configService = app.get(ConfigService);

    // Get configuration
    const appConfig = configService.get<AppConfig>("app");
    const { apiPrefix } = appConfig || { apiPrefix: "api" };

    // Initialize custom logger (same as main.ts)
    const loggerService = await app.resolve(WinstonLoggerService);

    // Set up the same configuration as in main.ts
    const exceptionFilter = new GlobalExceptionFilter(loggerService);
    app.useGlobalFilters(exceptionFilter);
    app.useGlobalPipes(new RequestValidationPipe());
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector))
    );
    app.setGlobalPrefix(apiPrefix);

    // Create Swagger configuration (same as main.ts)
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

    console.log("📝 Generating OpenAPI document...");

    // Generate OpenAPI document
    const document = SwaggerModule.createDocument(app, config);

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), "docs");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Created output directory: ${outputDir}`);
    }

    // Write JSON file
    const jsonPath = path.join(outputDir, "openapi.json");
    fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2));
    console.log(`✅ Generated OpenAPI JSON: ${jsonPath}`);

    // Write YAML file
    const yamlPath = path.join(outputDir, "openapi.yaml");
    const yamlContent = yaml.dump(document, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
    });
    fs.writeFileSync(yamlPath, yamlContent);
    console.log(`✅ Generated OpenAPI YAML: ${yamlPath}`);

    // Generate a summary
    const endpoints = Object.keys(document.paths || {});
    const totalEndpoints = endpoints.length;
    const methods = Object.values(document.paths || {})
      .flatMap((path) => Object.keys(path || {}))
      .filter((method) =>
        ["get", "post", "put", "delete", "patch"].includes(method.toLowerCase())
      );

    console.log("\n📊 Generation Summary:");
    console.log(`   📍 Total endpoints: ${totalEndpoints}`);
    console.log(`   🔧 Total operations: ${methods.length}`);
    console.log(
      `   🏷️  Tags: ${
        document.tags?.map((tag) => tag.name).join(", ") || "None"
      }`
    );
    console.log(`   📋 Output directory: ${outputDir}`);
    console.log("\n🎉 OpenAPI specification generated successfully!");

    // Close the application
    await app.close();
  } catch (error) {
    console.error("❌ Failed to generate OpenAPI specification:", error);
    process.exit(1);
  }
}

// Run the generator
generateOpenAPI().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
