import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.authUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        profile: true,
      },
    });

    if (!user || !user.profile) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    // Decimal alanları Prisma.Decimal bekler
    const data: Prisma.ProfileUpdateInput = {
      fullName: dto.fullName,
      gender: dto.gender,
      goalType: dto.goalType,
      activityLevel: dto.activityLevel,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      heightCm:
        dto.heightCm !== undefined
          ? new Prisma.Decimal(dto.heightCm)
          : undefined,
      weightKg:
        dto.weightKg !== undefined
          ? new Prisma.Decimal(dto.weightKg)
          : undefined,
      targetWeightKg:
        dto.targetWeightKg !== undefined
          ? new Prisma.Decimal(dto.targetWeightKg)
          : undefined,
    };

    return this.prisma.profile.update({
      where: { id: userId },
      data,
    });
  }
}
