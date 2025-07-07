import { ValidationPipe, BadRequestException } from "@nestjs/common";
import { ValidationError } from "class-validator";

export class RequestValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,

      exceptionFactory: (errors: ValidationError[]) => {
        const errorMessages = this.formatErrors(errors);
        return new BadRequestException(errorMessages);
      },
    });
  }

  private formatErrors(errors: ValidationError[]): string {
    return errors
      .map((error) => {
        const field = error.property;
        const constraints = error.constraints;
        if (constraints) {
          return `${field}: ${Object.values(constraints).join(", ")}`;
        }
        return `${field}: validation failed`;
      })
      .join("; ");
  }
}
