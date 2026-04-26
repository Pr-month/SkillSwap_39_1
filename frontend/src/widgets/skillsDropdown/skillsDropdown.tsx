import { useEffect, useState, forwardRef } from 'react';
import { skillsCategories, skillsMapping } from '@/shared/lib/categories';
import styles from './skillsDropdown.module.css';
import { useSelector } from '@/services/store/store';
import { getSkillsSelector } from '@/services/slices/skillsSlice';

interface SkillsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SkillsDropdown = forwardRef<HTMLDivElement, SkillsDropdownProps>(({ isOpen }, ref) => {
  const [isMobile, setIsMobile] = useState(false);
  const skills = useSelector(getSkillsSelector);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const groupedSkills = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = new Set();
      }
      acc[skill.category].add(skill.subcategory);
      return acc;
    },
    {} as Record<string, Set<string>>,
  );

  if (!isOpen) return null;

  const renderCategory = (
    skillscategory: string,
    subcategories: string[],
    iconPath: string,
    bgColor: string,
  ) => (
    <div className={styles.skillscategory} key={skillscategory}>
      <div className={styles.skillscategoryHeader}>
        <div className={styles.icon} style={{ backgroundColor: bgColor }}>
          <div
            className={styles.iconMask}
            style={{
              maskImage: `url(${iconPath})`,
              WebkitMaskImage: `url(${iconPath})`,
            }}
          />
        </div>
        <div className={styles.categoryContent}>
          <h3 className={styles.categoryTitle}>{skillscategory}</h3>
          <div className={styles.subcategories}>
            {subcategories.map(sub => (
              <div key={sub} className={styles.subcategory}>
                {sub}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const categories = Object.entries(skillsCategories).map(([category, subcategories]) => {
    const actualSubcategories = groupedSkills[category]
      ? Array.from(groupedSkills[category])
      : subcategories;
    return [category, actualSubcategories] as [string, string[]];
  });

  const firstColumnCategories = [categories[0], categories[2], categories[4]];
  const secondColumnCategories = [categories[1], categories[3], categories[5]];

  return (
    <div ref={ref} className={styles.skillsDropdown}>
      <div className={styles.skillsdropdownContent}>
        {!isMobile && (
          <>
            <div className={styles.skillscolumn}>
              {firstColumnCategories.map(([skillscategory, subcategories]) => {
                const { color, icon } = skillsMapping[skillscategory as keyof typeof skillsMapping];
                return renderCategory(skillscategory, subcategories, icon, color);
              })}
            </div>
            <div className={styles.skillscolumn}>
              {secondColumnCategories.map(([skillscategory, subcategories]) => {
                const { color, icon } = skillsMapping[skillscategory as keyof typeof skillsMapping];
                return renderCategory(skillscategory, subcategories, icon, color);
              })}
            </div>
          </>
        )}
        {isMobile && (
          <div className={styles.skillscolumn}>
            {categories.map(([skillscategory, subcategories]) => {
              const { color, icon } = skillsMapping[skillscategory as keyof typeof skillsMapping];
              return renderCategory(skillscategory, subcategories, icon, color);
            })}
          </div>
        )}
      </div>
    </div>
  );
});

SkillsDropdown.displayName = 'SkillsDropdown';
