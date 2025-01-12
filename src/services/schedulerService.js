import schedule from 'node-schedule';
import { getComplaintsForDay } from './complaintLogger.js';
import { sendDailyReport } from './notificationService.js';

export function setupDailyEmailJob() {
  // Schedule daily email at 11:59 PM
  schedule.scheduleJob('59 23 * * *', async () => {
    const complaints = await getComplaintsForDay(new Date());
    await sendDailyReport(complaints);
  });
}