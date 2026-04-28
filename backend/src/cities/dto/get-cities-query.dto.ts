import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { normalizeString } from '../../common/utils';

export class GetCitiesQueryDto {
  @ApiPropertyOptional({
    description: 'Поиск городов по части названия',
    example: 'моск',
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => normalizeString(String(value)))
  search?: string;
}
