import { CustomSkill } from '@/entities/skill/model/types';

export type User = {
  createdAt: string | number | Date;
  _id: string;
  name: string;
  image: string | File[];
  city: string;
  gender: GenderOption['value'];
  birthdayDate: string;
  description: string;
  likes: string[];
  canTeach: CustomSkill;
  wantsToLearn: Omit<CustomSkill, 'description' | 'image'>[];
  email?: string;
};

export type ExchangeRequest = {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId?: string;
  isRead: boolean;
  createdAt: string;
};

export type ExperienceOption = {
  value: 'all' | 'want-to-learn' | 'can-teach';
  label: string;
};

export type GenderOption = {
  value: 'any' | 'male' | 'female';
  label: string;
};

export type UserCardProps = User & {
  showDetails?: boolean;
  showLike?: boolean;
  showDescription?: boolean;
};
