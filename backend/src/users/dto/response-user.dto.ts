import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../common/enums/gender.enum';
import { Role } from '../../common/enums/role.enum';

export class ResponseUserDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    example: 'Анна Иванова',
  })
  name: string;

  @ApiProperty({
    example: 'anna@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    example: 'Люблю обмениваться навыками и учиться новому',
    nullable: true,
  })
  about?: string | null;

  @ApiPropertyOptional({
    example: '1998-05-20',
    format: 'date',
    nullable: true,
  })
  birthdate?: Date | null;

  @ApiPropertyOptional({
    example: 'Москва',
    nullable: true,
  })
  city?: string | null;

  @ApiPropertyOptional({
    enum: Gender,
    example: Gender.FEMALE,
    nullable: true,
  })
  gender?: Gender | null;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.png',
    nullable: true,
  })
  avatar?: string | null;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
  })
  role: Role;

  constructor(partial: Partial<ResponseUserDto>) {
    Object.assign(this, partial);
  }
}
