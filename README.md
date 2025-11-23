# slack-invoice-bot
A simple slack bot that automatically tracks invoices and sends direct reminders to team members when a payment is overdue

## Features
- 📊 Automatically checks for overdue invoices every 60 seconds
- 💬 Sends direct messages to assigned team members for overdue payments
- ⚡ Slash command `/test-collections` to view invoice status report
- 📝 JSON-based invoice storage for easy management

## Setup

### Prerequisites
- Node.js 14.x or higher
- A Slack workspace with admin access
- Slack App with Bot Token and Signing Secret

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cronenberg64/slack-invoice-bot.git
cd slack-invoice-bot
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env` file and add your Slack credentials:
     - `SLACK_BOT_TOKEN`: Your Slack Bot User OAuth Token (starts with `xoxb-`)
     - `SLACK_SIGNING_SECRET`: Your Slack App's Signing Secret

4. Update `invoices.json` with your actual invoice data:
   - `id`: Unique invoice identifier
   - `amount`: Invoice amount in dollars
   - `dueDate`: Due date in YYYY-MM-DD format
   - `client`: Client name
   - `status`: Invoice status (`overdue` or `pending`)
   - `assignedTo`: Slack User ID of the assigned team member

### Running the Bot

Start the bot:
```bash
npm start
```

The bot will:
- Load invoice data from `invoices.json`
- Start checking for overdue invoices every 60 seconds
- Send DM reminders to assigned users
- Listen for the `/test-collections` slash command

## Slack Command

### `/test-collections`
Displays a summary report of all invoices:
- Total invoices count
- Overdue invoices list
- Pending invoices list

## Invoice Data Structure

```json
{
  "id": "INV-001",
  "amount": 1500.00,
  "dueDate": "2025-11-15",
  "client": "Acme Corp",
  "status": "overdue",
  "assignedTo": "U12345678"
}
```

## License
MIT
