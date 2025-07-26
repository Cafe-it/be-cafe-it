import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { Response } from "express";
import { WinstonLoggerService } from "../services";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WinstonLoggerService)
    private readonly logger: WinstonLoggerService
  ) {
    this.logger.setContext(GlobalExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      this.handleHttpException(response, exception);
    } else {
      this.logger.error("Unhandled exception", JSON.stringify(exception));
      this.handleUnhandledException(response);
    }
  }

  private handleHttpException(response: Response, exception: HttpException) {
    const status = exception.getStatus();
    const message = exception.message;

    this.sendResponse(response, status, message);
  }

  private handleUnhandledException(response: Response) {
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = "Internal server error";

    this.sendResponse(response, status, message);
  }

  private sendResponse(response: Response, status: number, message: string) {
    response.status(status).json({
      statusCode: status,
      code: this.getErrorCode(status),
      message,
    });
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return "BAD_REQUEST";
      case HttpStatus.UNAUTHORIZED:
        return "UNAUTHORIZED";
      case HttpStatus.FORBIDDEN:
        return "FORBIDDEN";
      case HttpStatus.NOT_FOUND:
        return "NOT_FOUND";
      case HttpStatus.CONFLICT:
        return "CONFLICT";
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return "UNPROCESSABLE_ENTITY";
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return "INTERNAL_SERVER_ERROR";
      default:
        return "INTERNAL_SERVER_ERROR";
    }
  }
}
