import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

type PrismaMetaTarget =
  | string
  | string[]
  | { name?: string; value?: string }
  | Array<{ name?: string; value?: string }>;

function extractTarget(meta: unknown): string | null {
  if (!meta || typeof meta !== 'object') return null;

  const target = (meta as { target?: PrismaMetaTarget }).target;
  if (!target) return null;

  if (typeof target === 'string') return target;

  if (Array.isArray(target)) {
    const parts = target
      .map((t) => {
        if (typeof t === 'string') return t;

        if (t && typeof t === 'object' && 'name' in t) {
          const name = (t as { name?: string }).name;
          return typeof name === 'string' ? name : null;
        }

        return null;
      })
      .filter((x): x is string => Boolean(x));

    return parts.length ? parts.join(', ') : null;
  }

  if (typeof target === 'object' && 'name' in target) {
    const name = (target as { name?: string }).name;
    return typeof name === 'string' ? name : null;
  }

  return null;
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter<Prisma.PrismaClientKnownRequestError> {
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST;
    let message = 'Database error';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;

        const target = extractTarget(exception.meta);

        message = target
          ? `Already exists (unique constraint): ${target}`
          : 'Already exists (unique constraint)';

        break;
      }

      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;
      }

      case 'P2003': {
        status = HttpStatus.BAD_REQUEST;
        message = 'Foreign key constraint failed';
        break;
      }

      default: {
        message = 'Database request failed';
        break;
      }
    }

    res.status(status).json({
      ok: false,
      error: {
        code: exception.code,
        message,
      },
    });
  }
}
