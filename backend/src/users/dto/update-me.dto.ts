import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsIn(['female', 'male', 'other'])
  gender?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === '' ? undefined : Number(value),
  )
  @IsNumber()
  @Min(50)
  @Max(250)
  heightCm?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === '' ? undefined : Number(value),
  )
  @IsNumber()
  @Min(20)
  @Max(400)
  weightKg?: number;

  @IsOptional()
  @IsIn(['lose', 'maintain', 'gain'])
  goalType?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  activityLevel?: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === '' ? undefined : Number(value),
  )
  @IsNumber()
  @Min(20)
  @Max(400)
  targetWeightKg?: number;
}
