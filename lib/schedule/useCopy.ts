import { getAppLocale } from '../translations';
import { SCHEDULE_COPY, type ScheduleCopy } from './copy.ts';

export function useScheduleCopy(): ScheduleCopy {
  return SCHEDULE_COPY[getAppLocale()] ?? SCHEDULE_COPY.fr;
}
