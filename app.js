import bolt from '@slack/bolt';
const { App } = bolt;
import { readFileSync } from 'fs';
import 'dotenv/config';

// Config - PUT YOUR REAL TOKENS HERE
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
});

// Load fake invoice data
const invoices = JSON.parse(readFileSync('./invoices.json'));

// Store the user ID of the person who runs the test command
let adminUserId = null;

// Check for overdue invoices every minute
setInterval(async () => {
  if (!adminUserId) return; // Don't spam if we don't know who to DM yet

  console.log('Checking for overdue invoices...');

  const today = new Date().toISOString().split('T')[0];
  const overdue = invoices.invoices.filter(inv =>
    inv.dueDate < today && inv.status === 'overdue'
  );

  for (const invoice of overdue) {
    try {
      // Send DM to the admin user (YOU) instead of the fake ID
      await app.client.chat.postMessage({
        channel: adminUserId,
        text: `INVOICE ALERT: ${invoice.id} for ${invoice.client} is OVERDUE! Amount: ¥${invoice.amount.toLocaleString()}\n*Please follow up immediately!*`
      });

      console.log(`Sent reminder for ${invoice.id} to ${adminUserId}`);
      invoice.reminderCount++;

    } catch (error) {
      console.log('Failed to send message:', error.message);
    }
  }
}, 60000); // Check every minute

// Simple command to test the bot
app.command('/test-collections', async ({ command, ack, respond }) => {
  await ack();

  // Save your user ID so the background job knows who to DM
  adminUserId = command.user_id;
  console.log(`Admin user set to: ${adminUserId}`);

  const overdueCount = invoices.invoices.filter(inv =>
    inv.status === 'overdue'
  ).length;

  // Use 'respond' instead of 'say' to reply only to you (avoids not_in_channel error)
  await respond(`CollectionsBot is alive! ${overdueCount} overdue invoices found.\nI will now send alerts to you.`);
});

// Start the server
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('CollectionsBot is running on port 3000!');

  // Start ngrok automatically (you might need to do this manually)
  console.log('Now run: ngrok http 3000');
  console.log('Then update your Slack app with the ngrok URL + /slack/events');
})();
