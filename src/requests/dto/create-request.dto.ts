import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateRequestDto {
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  offeredSkillId?: string;

  @IsUUID()
  @IsNotEmpty()
  requestedSkillId: string;
}
