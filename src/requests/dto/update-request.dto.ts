import { IsEnum } from 'class-validator';
import { RequestStatus } from '../../common/enums/request-status.enum';

export class UpdateRequestDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;
}
