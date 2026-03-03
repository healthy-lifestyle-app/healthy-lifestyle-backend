import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.authUser.create({
        data: {
          email,
          password: passwordHash,
          provider: 'local',
          profile: {
            create: {},
          },
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      const accessToken = this.signToken(user.id);

      return {
        user,
        accessToken,
      };
    } catch (err: unknown) {
      if (this.isPrismaKnownRequestError(err) && err.code === 'P2002') {
        throw new BadRequestException('Email already in use');
      }

      throw err;
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.authUser.findUnique({
      where: { email },
      select: { id: true, email: true, password: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.signToken(user.id);

    return {
      user: { id: user.id, email: user.email },
      accessToken,
    };
  }

  private signToken(userId: string) {
    const payload = { sub: userId };

    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const expiresInRaw =
      this.configService.get<string>('JWT_EXPIRES_IN') ?? '7d';

    // Bazı jwt typings sürümleri expiresIn string kabul etmeyebilir.
    // Bu yüzden '7d', '1h' gibi değerleri saniyeye çevirip number veriyoruz.
    const expiresIn = this.parseExpiresInToSeconds(expiresInRaw);

    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
  }

  private parseExpiresInToSeconds(value: string): number {
    // Destek: '30s', '15m', '2h', '7d'
    const match = /^(\d+)(s|m|h|d)$/i.exec(value.trim());
    if (!match) {
      // Default: 7 gün
      return 7 * 24 * 60 * 60;
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };

    return amount * multipliers[unit];
  }

  private isPrismaKnownRequestError(
    err: unknown,
  ): err is Prisma.PrismaClientKnownRequestError {
    return err instanceof Prisma.PrismaClientKnownRequestError;
  }
}
