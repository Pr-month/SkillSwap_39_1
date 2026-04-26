import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreateRequestDto {
  @ApiProperty({
    example: 'aa0e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  requestedSkillId: string;

  @ApiProperty({
    example: '990e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  offeredSkillId?: string;
}
