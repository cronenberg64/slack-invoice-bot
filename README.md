# CollectionsBot MVP

A Slack bot that checks for overdue invoices and sends reminders to the assigned user.

## Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Configure environment:**
    Copy `.env.example` to `.env` and fill in your Slack tokens.
    ```bash
    cp .env.example .env
    ```

3.  **Start the bot:**
    ```bash
    npm start
    ```

4.  **Expose local server:**
    ```bash
    ngrok http 3000
    ```

## Features

-   Checks for overdue invoices every minute.
-   DMs the assigned user.
-   `/test-collections` command to verify status.
