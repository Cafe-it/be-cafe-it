import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { CafeModule } from "./cafe/cafe.module";
import { appConfig, databaseConfig, loggingConfig } from "./common/config";
import { WinstonLoggerService } from "./common/services";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [appConfig, databaseConfig, loggingConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("database.uri"),
      }),
      inject: [ConfigService],
    }),
    CafeModule,
  ],
  controllers: [],
  providers: [WinstonLoggerService],
  exports: [WinstonLoggerService],
})
export class AppModule {}
