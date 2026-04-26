import React from 'react';
import styles from './skill.module.css';
import { CATEGORY_CLASS_MAP } from './skill.ts';

export type SkillCategory =
  | 'Бизнес и карьера'
  | 'Творчество и искусство'
  | 'Иностранные языки'
  | 'Образование и развитие'
  | 'Дом и уют'
  | 'Здоровье и лайфстайл'
  | 'Остальные категории';

export type TSkillProps = {
  children: React.ReactNode;
  type: SkillCategory;
};

export const Skill: React.FC<TSkillProps> = ({ children, type }) => {
  const categoryClass = CATEGORY_CLASS_MAP[type];

  const skillClasses = `${styles.skill} ${categoryClass ? styles[categoryClass] : styles.default}`;

  return (
    <div className={skillClasses}>
      <span className={styles.content}>{children}</span>
    </div>
  );
};
