import cron from 'node-cron';
import { generateChallenge } from '../ai/services/challenges.service';

// Daily at 2:35 PM
cron.schedule('20 19 * * *', async () => {
  console.log('Running daily challenge generation...');
  try {
    const challenges = await generateChallenge('daily');
    // TODO: Save challenges to database
    console.log('Daily challenges generated successfully:', challenges.length);
  } catch (error) {
    console.error('Daily challenge generation failed:', error);
    // TODO: Send alert to admin or retry logic
  }
});

// Weekly on Monday at 2:35 PM  
cron.schedule('20 19 * * 2', async () => {
  console.log('Running weekly challenge generation...');
  try {
    const challenges = await generateChallenge('weekly');
    // TODO: Save challenges to database
    console.log('Weekly challenges generated successfully:', challenges.length);
  } catch (error) {
    console.error('Weekly challenge generation failed:', error);
    // TODO: Send alert to admin or retry logic
  }
});

// Monthly on 1st day at 2:35 PM
cron.schedule('20 19 23 * *', async () => {
  console.log('Running monthly challenge generation...');
  try {
    const challenges = await generateChallenge('monthly');
    // TODO: Save challenges to database
    console.log('Monthly challenges generated successfully:', challenges.length);
  } catch (error) {
    console.error('Monthly challenge generation failed:', error);
    // TODO: Send alert to admin or retry logic
  }
});