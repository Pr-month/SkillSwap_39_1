import { Skill } from '@/shared/ui/skill/skill.tsx';
import styles from './userCard.module.css';
import { Button } from '@/shared/ui/button/button';
import { calculateAge } from '@/shared/lib/helpers/data';
import { User } from '@/entities/user/model/types';
import { useDispatch, useSelector } from '@/services/store/store';
import { selectIsLiked } from '@/services/selectors/likeSelectors';
import { toggleLike } from '@/services/slices/likeSlice';
import { useNavigate } from 'react-router-dom';
import { useExchange } from '@/shared/hooks/useExchange';

type UserCardProps = User & {
  showLike?: boolean;
  showDescription?: boolean;
  showDetails?: boolean;
};

export const UserCard: React.FC<UserCardProps> = ({
  image,
  name,
  city,
  canTeach,
  wantsToLearn,
  _id,
  birthdayDate,
  description,
  showLike = true,
  showDescription = false,
  showDetails = true,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hasSentRequest } = useExchange();
  const alreadyRequested = hasSentRequest(_id);
  const learnSkill = wantsToLearn.slice(0, 2);
  const moreSkills = wantsToLearn.length - learnSkill.length;
  const isLiked = useSelector(state => selectIsLiked(state, _id));

  const handleLikeClick = () => {
    dispatch(toggleLike(_id));
  };

  const openProfile = () => {
    navigate(`/skill/${_id}`);
  };

  const imageUrl = typeof image === 'string' ? image : undefined;

  return (
    <div className={styles.cardContainer}>
      <div className={styles.headerCard}>
        <img src={imageUrl} alt={`Avatar ${name}`} className={styles.image} />
        {showLike && (
          <div className={styles.cardLike}>
            <button
              onClick={handleLikeClick}
              className={`${styles.likeButton} ${isLiked ? styles.likeButtonActive : ''}`}
            />
          </div>
        )}
        <div className={styles.userInfo}>
          <p className={styles.userName}>{name}</p>
          <p className={styles.userCityAndAge}>{`${city}, ${calculateAge(birthdayDate)}`}</p>
        </div>
      </div>
      <div className={styles.bodyCard}>
        {showDescription && <p className={styles.description}>{description}</p>}
        <div className={styles.teach}>
          <p className={styles.pointCard}>Может научить:</p>
          <div className={styles.skills}>
            {canTeach ? <Skill type={canTeach.category}>{canTeach.name}</Skill> : ''}
          </div>
        </div>
        <div className={styles.teach}>
          <p className={styles.pointCard}>Хочет научиться:</p>
          <div className={styles.skills}>
            {learnSkill &&
              learnSkill.map(skill => (
                <Skill type={skill.category} key={skill.customSkillId}>
                  {skill.name}
                </Skill>
              ))}
            {wantsToLearn.length > 2 && (
              <Skill type={'Остальные категории'}>{`+ ${moreSkills}`}</Skill>
            )}
          </div>
        </div>
      </div>
      {showDetails &&
        (alreadyRequested ? (
          <Button onClick={openProfile} type="secondary">
            <span className={styles.contentClock}>
              <div className={styles.clock} />
              <span>Обмен предложен</span>
            </span>
          </Button>
        ) : (
          <Button onClick={openProfile} type="primary">
            Подробнее
          </Button>
        ))}
    </div>
  );
};
