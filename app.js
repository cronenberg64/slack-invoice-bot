import { App } from '@slack/bolt';
import { readFileSync } from 'fs';

// Config - PUT YOUR REAL TOKENS HERE
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
});

// Load fake invoice data
const invoices = JSON.parse(readFileSync('./invoices.json'));

// Check for overdue invoices every minute
setInterval(() => {
  console.log('🔍 Checking for overdue invoices...');
  
  const today = new Date().toISOString().split('T')[0];
  const overdue = invoices.invoices.filter(inv => 
    inv.dueDate < today && inv.status === 'overdue'
  );

  overdue.forEach(async (invoice) => {
    try {
      // Send DM to assigned person
      await app.client.chat.postMessage({
        channel: invoice.assignedTo,
        text: `🚨 INVOICE ALERT: ${invoice.id} for ${invoice.client} is OVERDUE! Amount: ¥${invoice.amount.toLocaleString()}\n*Please follow up immediately!*`
      });
      
      console.log(`💌 Sent reminder for ${invoice.id} to ${invoice.assignedTo}`);
      invoice.reminderCount++;
      
    } catch (error) {
      console.log('❌ Failed to send message:', error);
    }
  });
}, 60000); // Check every minute

// Simple command to test the bot
app.command('/test-collections', async ({ command, ack, say }) => {
  await ack();
  
  const overdueCount = invoices.invoices.filter(inv => 
    inv.status === 'overdue'
  ).length;
  
  await say(`📊 CollectionsBot is alive! ${overdueCount} overdue invoices found.`);
});

// Start the server
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡ CollectionsBot is running on port 3000!');
  
  // Start ngrok automatically (you might need to do this manually)
  console.log('👉 Now run: ngrok http 3000');
  console.log('👉 Then update your Slack app with the ngrok URL + /slack/events');
})();
