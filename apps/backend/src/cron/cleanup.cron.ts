import cron from 'node-cron';
import { cleanupOldTokens } from '../services/resfreshToken.service';

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('🧹 Cleaning up old refresh tokens...');
  try {
    await cleanupOldTokens();
    console.log('✅ Token cleanup complete');
  } catch (error) {
    console.error('❌ Token cleanup failed:', error);
  }
});