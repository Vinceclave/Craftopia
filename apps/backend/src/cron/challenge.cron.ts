import cron from 'node-cron';
import { createChallenges } from '../ai/services/challenges.service';

// Daily at 10:25 PM
cron.schedule('54 22 * * *', () => createChallenges(['plastic','paper','glass'], 'daily'));

// Weekly Monday at 10:25 PM
cron.schedule('54 22 * * 1', () => createChallenges(['metal','textile','glass'], 'weekly'));

// Monthly 1st day at 10:25 PM
cron.schedule('54 22 1 * *', () => createChallenges(['electronics','organic','plastic'], 'monthly'));
