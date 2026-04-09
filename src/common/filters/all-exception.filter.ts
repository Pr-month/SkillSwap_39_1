import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

type ErrorResponse = {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
};

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const error = this.resolveError(exception);

    response.status(error.statusCode).json({
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: error.message,
    } satisfies ErrorResponse);
  }

  private resolveError(
    exception: unknown,
  ): Pick<ErrorResponse, 'statusCode' | 'message'> {
    if (exception instanceof EntityNotFoundError) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Сущность не найдена',
      };
    }

    if (this.isDuplicateKeyError(exception)) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'Ошибка дубликата данных',
      };
    }

    if (exception instanceof PayloadTooLargeException) {
      return {
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        message: 'Файл слишком большого размера',
      };
    }

    if (exception instanceof HttpException) {
      return {
        statusCode: exception.getStatus(),
        message: this.extractHttpExceptionMessage(exception),
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Внутренняя ошибка сервера',
    };
  }

  private isDuplicateKeyError(exception: unknown): boolean {
    if (!(exception instanceof QueryFailedError)) {
      return false;
    }

    return (exception as QueryFailedError & { code?: string }).code === '23505';
  }

  private extractHttpExceptionMessage(
    exception: HttpException,
  ): string | string[] {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (
      typeof response === 'object' &&
      response !== null &&
      'message' in response
    ) {
      return (response as { message: string | string[] }).message;
    }

    return exception.message;
  }
}
