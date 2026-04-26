import { stepActions } from '@/services/slices/stepSlice';
import { useDispatch } from '@/services/store/store';
import { useEffect } from 'react';

export const useSteps = (stepCount: number) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(stepActions.initializeSteps(stepCount));
  }, [dispatch, stepCount]);
};
