import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Gender } from '../../common/enums/gender.enum';
import { normalizeString } from '../../common/utils';

export class GetUsersQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => normalizeString(String(value)))
  city?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => normalizeString(String(value)))
  name?: string;
}
