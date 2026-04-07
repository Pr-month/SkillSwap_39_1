import { IsOptional, IsUUID } from 'class-validator';

export class CreateRequestDto {
  @IsUUID()
  requestedSkillId: string;

  @IsOptional()
  @IsUUID()
  offeredSkillId?: string;
}
