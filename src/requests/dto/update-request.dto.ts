import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RequestStatus } from '../../common/enums/request-status.enum';

export class UpdateRequestDto {
  @ApiProperty({
    enum: RequestStatus,
    example: RequestStatus.ACCEPTED,
  })
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
