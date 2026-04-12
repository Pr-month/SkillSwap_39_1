import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { normalizeString } from '../../common/utils';

export class GetCitiesQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => normalizeString(String(value)))
  search?: string;
}
