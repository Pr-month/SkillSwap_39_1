import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;
}
