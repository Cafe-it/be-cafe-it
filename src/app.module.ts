import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { CafeModule } from "./cafe/cafe.module";
import { AuthModule } from "./auth/auth.module";
import { OwnerModule } from "./owner/owner.module";
import { appConfig, databaseConfig, authConfig } from "./common/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [appConfig, databaseConfig, authConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("database.uri"),
      }),
      inject: [ConfigService],
    }),
    CafeModule,
    AuthModule,
    OwnerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
