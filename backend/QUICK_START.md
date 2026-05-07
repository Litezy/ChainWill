# Quick Start Guide - ChainWill Approval Event Tracking

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis instance (local or managed)
- Sepolia testnet RPC endpoint
- Environment variables configured

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

**Required variables:**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/chainwill
DIRECT_URL=postgresql://user:pass@localhost:5432/chainwill
RPC_URL=https://rpc.sepolia.org
CWT_ADDRESS=0x9b068dC0418064C11d9bc563edC26890DD95a60e
ADMIN_PRIVATE_KEY=0xyour_admin_private_key_here
REDIS_URL=redis://127.0.0.1:6379
```

`ADMIN_PRIVATE_KEY` must be the same admin/deployer key that the will contracts
expect for `triggerByTime()`. The inactivity relayer will not start without it.

**Email delivery variables:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
MAIL_FROM=ChainWill <no-reply@chainwill.app>
MAIL_REPLY_TO=support@chainwill.app
MAIL_SUPPORT_EMAIL=support@chainwill.app
APP_FRONTEND_URL=http://localhost:5173
```

If `SMTP_HOST` is omitted, the backend falls back to a local preview transport and logs the generated email instead of sending it.

### 3. Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Create database schema
npx prisma migrate deploy

# (Optional) Seed database with test data
npx prisma db seed
```

### 4. Build the Project

```bash
npm run build
```

### 5. Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will:
- Start on the configured PORT (default: 8000)
- Start the BullMQ notification worker unless `NOTIFICATION_WORKER_AUTOSTART=false`
- Initialize ApprovalListenerService (polls every 30s)
- Initialize EffectivePullAmountService (updates every 60s)
- Initialize the admin relayer cron job (runs every 60s and opens attestation windows)
- Initialize NotificationWorker for queued emails
- Be ready to accept API requests

If you want the worker in a separate process:

```bash
npm run dev:notifications
```

Then set:

```env
NOTIFICATION_WORKER_AUTOSTART=false
```

## Testing the Implementation

### 1. Verify Services Started
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "ChainWill API is running",
  "web3Services": "running",
  "relayer": {
    "running": true,
    "configured": true
  }
}
```

### 2. Create a Test Will

On-chain:
1. Deploy a ChainWill via factory
2. Call `token.approve(willAddress, 1000000000000000000)` (1 token)

### 3. Check Approval Was Tracked

```bash
# Get will details (includes approval history)
curl http://localhost:8000/api/wills/{willId}

# Get detailed approval history
curl http://localhost:8000/api/wills/{willId}/approval-history?limit=20
```

### 4. Manually Refresh Effective Amount

```bash
curl -X POST http://localhost:8000/api/wills/{willId}/refresh-effective-amount
```

## Monitoring

### View Logs

All services log with prefixes:
- `[ApprovalListener]` - Approval event detection
- `[EffectivePullAmount]` - Amount calculations
- `[NotificationQueue]` - Queueing alerts into Redis
- `[NotificationWorker]` - Processing queued email jobs
- `[Web3EventService]` - Service lifecycle

Example:
```
[ApprovalListener] Starting approval event listener...
[ApprovalListener] Starting from block 5123456
[ApprovalListener] Found 1 approval events
[ApprovalListener] Updated will abc123 with approvedAmount: 1000000000000000000
[EffectivePullAmount] Updating 1 wills...
[EffectivePullAmount] Updated will abc123: 1000000000000000000
```

### Database Queries

Check approval history:
```sql
SELECT * FROM "Erc20Approval" 
WHERE "willId" = 'your-will-id' 
ORDER BY "timestamp" DESC;
```

Check effective amounts:
```sql
SELECT id, "approvedAmount", "effectivePullAmount" 
FROM "Will" 
WHERE "isLocked" = false;
```

## Troubleshooting

### Services not starting
- Check RPC connectivity: `curl $RPC_URL`
- Verify database connection: `psql $DATABASE_URL -c "SELECT 1"`
- Check logs for specific errors

### Approvals not appearing
- Wait for next poll cycle (max 30 seconds)
- Check that address matches deployed will
- Verify spender is the will contract address

### Effective amount not updating
- Ensure will contract is valid
- Check that contract has proper ABI compatibility
- Manually trigger: `POST /api/wills/{willId}/refresh-effective-amount`

## Configuration Tuning

For high throughput environments:

```env
# Faster polling (but uses more RPC calls)
APPROVAL_POLL_INTERVAL=15000

# More frequent updates (but more DB writes)
EFFECTIVE_AMOUNT_UPDATE_INTERVAL=30000

# More parallel updates (but risk RPC rate limit)
MAX_PARALLEL_UPDATES=10
```

For reliability with rate limits:

```env
# Slower polling
APPROVAL_POLL_INTERVAL=60000

# Less frequent updates
EFFECTIVE_AMOUNT_UPDATE_INTERVAL=120000

# Conservative parallel updates
MAX_PARALLEL_UPDATES=2
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "start"]
```

### Environment Setup for Production

1. Use managed PostgreSQL service
2. Use production RPC provider (Alchemy, Infura, QuickNode)
3. Enable application monitoring (better logs, metrics)
4. Set up alerts for service failures
5. Configure horizontal scaling if needed
6. Provision Redis and Resend before enabling email delivery in production

## Next Steps

1. Read [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for architecture details
2. Review [src/services](./src/services) for service implementations
3. Check [src/routes](./src/routes) for available endpoints
4. Set up CI/CD pipeline for automated testing and deployment
