import { IsOptional, IsUUID } from 'class-validator';

export class CreateRequestDto {
  @IsUUID()
  receiverId: string;

  @IsOptional()
  @IsUUID()
  offeredSkillId?: string;

  @IsOptional()
  @IsUUID()
  requestedSkillId?: string;
}
