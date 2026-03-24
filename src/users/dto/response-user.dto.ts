import { Gender } from 'src/common/enums/gender.enum';
import { Role } from 'src/common/enums/role.enum';

export class ResponseUserDto {
  id: string;
  name: string;
  email: string;
  about?: string;
  birthdate?: Date;
  city?: string;
  gender?: Gender;
  avatar?: string;
  role: Role;

  constructor(partial: Partial<ResponseUserDto>) {
    Object.assign(this, partial);
  }
}
