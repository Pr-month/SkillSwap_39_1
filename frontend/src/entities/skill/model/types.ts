import { skillsCategories } from '@/shared/lib/categories';

export type SkillCategory = keyof typeof skillsCategories;
export type SkillSubcategory<T extends SkillCategory> = (typeof skillsCategories)[T][number];

export type Skill = {
  [K in SkillCategory]: {
    category: K;
    subcategory: SkillSubcategory<K>;
    subcategoryId: string;
  };
}[SkillCategory];

export type CustomSkill = Skill & {
  name: string;
  image: string[] | File[];
  description: string;
  customSkillId: string;
};
