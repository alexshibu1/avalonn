import fs from 'fs/promises';
import path from 'path';

const LOGS_DIR = './logs';
const COMPLAINTS_FILE = 'complaints.json';

export async function logComplaint(complaintDetails) {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
    
    const filePath = path.join(LOGS_DIR, COMPLAINTS_FILE);
    let complaints = [];
    
    try {
      const data = await fs.readFile(filePath, 'utf8');
      complaints = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, start with empty array
    }
    
    complaints.push({
      ...complaintDetails,
      timestamp: new Date().toISOString()
    });
    
    await fs.writeFile(filePath, JSON.stringify(complaints, null, 2));
    return true;
  } catch (error) {
    console.error('Error logging complaint:', error);
    return false;
  }
}

export async function getComplaintsForDay(date) {
  try {
    const filePath = path.join(LOGS_DIR, COMPLAINTS_FILE);
    const data = await fs.readFile(filePath, 'utf8');
    const complaints = JSON.parse(data);
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return complaints.filter(complaint => {
      const complaintDate = new Date(complaint.timestamp);
      return complaintDate >= dayStart && complaintDate <= dayEnd;
    });
  } catch (error) {
    console.error('Error getting complaints:', error);
    return [];
  }
}