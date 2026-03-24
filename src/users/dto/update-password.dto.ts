import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  newPassword: string;
}
