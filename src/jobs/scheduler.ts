import cron from 'node-cron';
import { runDailyRefill } from './dailyRefill.job.js';
import { runSessionCleanup } from './sessionCleanup.job.js';
import { runTournamentEnd } from './tournamentEnd.job.js';

const tasks: cron.ScheduledTask[] = [];

export function startCronJobs(): void {
  // Daily reset at midnight UTC
  tasks.push(
    cron.schedule('0 0 * * *', async () => {
      try {
        await runDailyRefill();
      } catch (error) {
        console.error('Daily refill job failed:', error);
      }
    }),
  );

  // Session cleanup every 15 minutes
  tasks.push(
    cron.schedule('*/15 * * * *', async () => {
      try {
        await runSessionCleanup();
      } catch (error) {
        console.error('Session cleanup job failed:', error);
      }
    }),
  );

  // Tournament end check every 5 minutes
  tasks.push(
    cron.schedule('*/5 * * * *', async () => {
      try {
        await runTournamentEnd();
      } catch (error) {
        console.error('Tournament end job failed:', error);
      }
    }),
  );

  console.log('Cron jobs started');
}

export function stopCronJobs(): void {
  for (const task of tasks) {
    task.stop();
  }
  tasks.length = 0;
  console.log('Cron jobs stopped');
}
