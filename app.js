import { App } from '@slack/bolt';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET;

// Initialize Bolt app
const app = new App({
  token: SLACK_BOT_TOKEN,
  signingSecret: SLACK_SIGNING_SECRET
});

// Load invoices data
const invoicesPath = join(__dirname, 'invoices.json');
let invoices = [];

try {
  const invoicesData = readFileSync(invoicesPath, 'utf8');
  invoices = JSON.parse(invoicesData);
  console.log(`Loaded ${invoices.length} invoices from invoices.json`);
} catch (error) {
  console.error('Error loading invoices:', error);
}

// Function to check if an invoice is overdue
function isOverdue(invoice) {
  if (invoice.status !== 'overdue') {
    return false;
  }
  const dueDate = new Date(invoice.dueDate);
  const today = new Date();
  return dueDate < today;
}

// Function to send overdue invoice reminders
async function sendOverdueReminders() {
  console.log('Checking for overdue invoices...');
  
  const overdueInvoices = invoices.filter(isOverdue);
  
  if (overdueInvoices.length === 0) {
    console.log('No overdue invoices found.');
    return;
  }
  
  console.log(`Found ${overdueInvoices.length} overdue invoice(s)`);
  
  for (const invoice of overdueInvoices) {
    try {
      await app.client.chat.postMessage({
        token: SLACK_BOT_TOKEN,
        channel: invoice.assignedTo,
        text: `⚠️ *Overdue Invoice Reminder*\n\n` +
              `Invoice ID: ${invoice.id}\n` +
              `Client: ${invoice.client}\n` +
              `Amount: $${invoice.amount.toFixed(2)}\n` +
              `Due Date: ${invoice.dueDate}\n` +
              `Status: ${invoice.status}\n\n` +
              `Please follow up on this overdue payment.`
      });
      console.log(`Sent reminder for invoice ${invoice.id} to user ${invoice.assignedTo}`);
    } catch (error) {
      console.error(`Error sending message for invoice ${invoice.id}:`, error);
    }
  }
}

// Set up 60-second interval to check for overdue invoices
setInterval(() => {
  sendOverdueReminders();
}, 60000); // 60 seconds

// Initial check on startup
sendOverdueReminders();

// Add /test-collections command
app.command('/test-collections', async ({ command, ack, say }) => {
  await ack();
  
  console.log(`/test-collections command received from user ${command.user_id}`);
  
  const overdueInvoices = invoices.filter(isOverdue);
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
  
  let response = `📊 *Invoice Collections Report*\n\n`;
  response += `Total Invoices: ${invoices.length}\n`;
  response += `Overdue Invoices: ${overdueInvoices.length}\n`;
  response += `Pending Invoices: ${pendingInvoices.length}\n\n`;
  
  if (overdueInvoices.length > 0) {
    response += `*Overdue Invoices:*\n`;
    overdueInvoices.forEach(inv => {
      response += `• ${inv.id} - ${inv.client} - $${inv.amount.toFixed(2)} (Due: ${inv.dueDate})\n`;
    });
    response += `\n`;
  }
  
  if (pendingInvoices.length > 0) {
    response += `*Pending Invoices:*\n`;
    pendingInvoices.forEach(inv => {
      response += `• ${inv.id} - ${inv.client} - $${inv.amount.toFixed(2)} (Due: ${inv.dueDate})\n`;
    });
  }
  
  await say(response);
});

// Start the app
(async () => {
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`⚡️ Slack Invoice Bot is running on port ${port}!`);
})();
