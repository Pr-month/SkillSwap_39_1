import {IsUUID, IsNotEmpty } from 'class-validator';

export class CreateRequestDto {
  @IsUUID()
  @IsNotEmpty()
  offeredSkillId: string;

  @IsUUID()
  @IsNotEmpty()
  requestedSkillId: string;
}
