import { logger } from '../../utils/logger';
import Astrologer from '../../models/astrologer.model';

export const resetAstroQuota = async (): Promise<void> => {
  logger.info('Running resetAstroQuota job');
  
  try {
    await Astrologer.update(
      { quota_used: 0 },
      {
        where: {
          is_delete: false,
          status: true,
          is_verified: true,
        },
      }
    );
    logger.info('Astrologer quota reset successfully');
  } catch (error) {
    logger.error('Error resetting astrologer quota:', error);
  }
};
