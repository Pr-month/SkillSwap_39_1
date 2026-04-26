import { toggleLike } from '@/services/slices/likeSlice';
import { selectIsLiked, selectLikesLoading } from '@/services/selectors/likeSelectors';
import { useDispatch, useSelector } from '@/services/store/store';

interface UseLikeProps {
  itemId: string;
}

export const useLike = ({ itemId }: UseLikeProps) => {
  const dispatch = useDispatch();
  const isLiked = useSelector(state => selectIsLiked(state, itemId));
  const isLoading = useSelector(selectLikesLoading);

  const toggleLikeHandler = () => {
    dispatch(toggleLike(itemId));
  };

  return {
    isLiked,
    isLoading,
    toggleLike: toggleLikeHandler,
  };
};
