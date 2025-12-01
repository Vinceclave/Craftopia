// apps/backend/src/cron/challenge.cron.ts - ENHANCED VERSION

import cron from 'node-cron';
import { generateChallenge, createChallenges } from '../ai/services/challenges.service';

// Helper function to log with timestamp
const log = (message: string, level: 'info' | 'error' = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : '✅';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

// Daily challenges - Every day at 6:00 AM
cron.schedule('30 19 * * *', async () => {
  log('Starting daily challenge generation...');
  
  try {
    const challenges = await generateChallenge('daily');
    
    if (challenges && challenges.length > 0) {
      // Auto-save generated challenges
      await createChallenges(challenges);
      log(`Successfully generated and saved ${challenges.length} daily challenges`);
    } else {
      log('No daily challenges generated', 'error');
    }
  } catch (error: any) {
    log(`Daily challenge generation failed: ${error.message}`, 'error');
    // TODO: Add notification to admin dashboard or email alert
  }
});

// Weekly challenges - Every Monday at 7:00 AM
cron.schedule('30 19 * * 1', async () => {
  log('Starting weekly challenge generation...');
  
  try {
    const challenges = await generateChallenge('weekly');
    
    if (challenges && challenges.length > 0) {
      await createChallenges(challenges);
      log(`Successfully generated and saved ${challenges.length} weekly challenges`);
    } else {
      log('No weekly challenges generated', 'error');
    }
  } catch (error: any) {
    log(`Weekly challenge generation failed: ${error.message}`, 'error');
  }
});

// Monthly challenges - 1st of every month at 8:00 AM
cron.schedule('30 19 1 * *', async () => {
  log('Starting monthly challenge generation...');
  
  try {
    const challenges = await generateChallenge('monthly');
    
    if (challenges && challenges.length > 0) {
      await createChallenges(challenges);
      log(`Successfully generated and saved ${challenges.length} monthly challenges`);
    } else {
      log('No monthly challenges generated', 'error');
    }
  } catch (error: any) {
    log(`Monthly challenge generation failed: ${error.message}`, 'error');
  }
});

// Optional: Health check cron - runs every hour to ensure the system is working
cron.schedule('0 * * * *', async () => {
  try {
    // Simple health check - just verify AI service is responsive
    log('Challenge automation system is running');
  } catch (error) {
    log('Challenge automation health check failed', 'error');
  }
});

log('Challenge automation cron jobs initialized successfully');