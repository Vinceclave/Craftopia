import cron from 'node-cron';
import { cleanupOldTokens } from '../services/resfreshToken.service';

// Run every hour
cron.schedule('0 * * * *', async () => {
  try {
    await cleanupOldTokens();
  } catch (error) {
    console.error('❌ Token cleanup failed:', error);
  }
});