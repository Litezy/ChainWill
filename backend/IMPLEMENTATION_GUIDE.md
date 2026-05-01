# ChainWill Approval Event Tracking Implementation

## Overview

This implementation adds comprehensive event tracking and on-chain data synchronization to the ChainWill backend. It consists of three main components:

1. **ApprovalListenerService** - Listens for ERC20 Approval events on the ChainWillToken (CWT) contract
2. **EffectivePullAmountService** - Periodically updates the effective pull amount for wills
3. **Web3EventService** - Orchestrates the lifecycle of both services

## Architecture

### Event Flow

```
ChainWill User
    │
    ├─→ User calls token.approve(willAddress, amount)
    │
    ├─→ Approval(owner, spender, value) event emitted on CWT
    │
    ├─→ ApprovalListenerService detects event
    │
    ├─→ Updates Will.approvedAmount in database
    │
    ├─→ Creates Erc20Approval audit record
    │
    └─→ EffectivePullAmountService updates Will.effectivePullAmount
        by calling getEffectivePullAmount() on the will contract
```

### Service Components

#### 1. ApprovalListenerService (`src/services/approvalListener.ts`)

**Purpose**: Monitor for Approval events on the CWT token contract where spender == willAddress.

**Key Features**:
- **Poll-based approach**: Uses `getLogs()` to poll for events every 30 seconds (configurable)
- **Block tracking**: Maintains `lastProcessedBlock` to avoid duplicate processing
- **Multi-will support**: Handles multiple wills with the same owner
- **Audit trail**: Creates `Erc20Approval` records for all events
- **Error resilience**: Continues polling even if individual events fail

**Configuration**:
```env
APPROVAL_POLL_INTERVAL=30000  # Polling interval in milliseconds
CWT_ADDRESS=0x9b...           # ChainWillToken contract address
```

**Process**:
1. Polls CWT contract for Approval events
2. Filters for events where `spender == willAddress`
3. Finds corresponding Will record in database
4. Updates `approvedAmount` with the new value
5. Creates audit records in `Erc20Approval` and `EventLog`

#### 2. EffectivePullAmountService (`src/services/effectivePullAmount.ts`)

**Purpose**: Periodically calculate and update the effective amount that will be pulled at trigger time.

**Key Features**:
- **Periodic updates**: Updates all non-locked wills every 60 seconds (configurable)
- **Contract calls**: Calls `getEffectivePullAmount()` view function on each will
- **Batch processing**: Processes wills in batches to prevent RPC overload
- **Manual trigger**: Allows immediate updates via `updateWillById(willId)`
- **Error isolation**: Failure on one will doesn't affect others

**Configuration**:
```env
EFFECTIVE_AMOUNT_UPDATE_INTERVAL=60000  # Update interval in milliseconds
MAX_PARALLEL_UPDATES=5                  # Max concurrent contract calls
```

**Process**:
1. Fetches all non-locked wills from database
2. For each will (in batches):
   - Calls `getEffectivePullAmount()` on the will contract
   - Updates `effectivePullAmount` in database
3. Repeats periodically

#### 3. Web3EventService (`src/services/web3EventService.ts`)

**Purpose**: Manage the lifecycle of all Web3-related services.

**Features**:
- **Unified startup/shutdown**: Single entry point for all services
- **Error handling**: Ensures graceful degradation
- **Health check**: Provides service status via `isHealthy()`
- **Logging**: Comprehensive logging for debugging

## Database Schema

### Updated Models

#### Will Table
```prisma
model Will {
  // ... existing fields
  approvedAmount        String    @default("0")  // Tracked from Approval events
  effectivePullAmount   String    @default("0")  // min(approvedAmount, ownerWalletBalance)
  // ... existing fields
}
```

#### Erc20Approval Table (Audit Trail)
```prisma
model Erc20Approval {
  id             String   @id @default(uuid())
  willId         String
  ownerAddress   String
  tokenAddress   String
  approvedAmount String
  blockNumber    Int
  timestamp      DateTime @default(now())
  will           Will     @relation(fields: [willId], references: [id])
}
```

## API Endpoints

### 1. Get Will Details
```
GET /api/wills/:willId
```

Returns full will details including last 10 approvals.

**Response**:
```json
{
  "id": "uuid",
  "contractAddress": "0x...",
  "ownerAddress": "0x...",
  "approvedAmount": "1000000000000000000",
  "effectivePullAmount": "500000000000000000",
  "beneficiaries": [...],
  "signers": [...],
  "erc20Approvals": [...]
}
```

### 2. Manual Effective Amount Refresh
```
POST /api/wills/:willId/refresh-effective-amount
```

Manually trigger a refresh of the effective pull amount for a single will.

**Response**:
```json
{
  "message": "Effective pull amount updated",
  "effectivePullAmount": "500000000000000000"
}
```

### 3. Approval History
```
GET /api/wills/:willId/approval-history?limit=50&offset=0
```

Get approval event history for a will.

**Response**:
```json
{
  "approvals": [
    {
      "id": "uuid",
      "ownerAddress": "0x...",
      "approvedAmount": "1000000000000000000",
      "blockNumber": 12345,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

## Error Handling

### ApprovalListener Error Handling
- **Block polling errors**: Logged and continues polling
- **Event processing errors**: Per-event error handling, doesn't block other events
- **Database errors**: Logs error and continues
- **Duplicate txHash**: Handled gracefully with unique constraint check

### EffectivePullAmount Error Handling
- **RPC call failures**: Logged and continues with other wills
- **Contract reverts**: Caught and logged, continues processing
- **Database errors**: Caught and logged, continues processing
- **Batch failures**: Individual batch failures don't affect other batches

## Logging

All services use console-based logging with prefixes for easy identification:
- `[ApprovalListener]` - Approval event listener logs
- `[EffectivePullAmount]` - Effective amount service logs
- `[Web3EventService]` - Service orchestration logs
- `[Error]` - Error logs are prefixed with context

## Graceful Shutdown

The server implements proper graceful shutdown:
1. Listens for `SIGTERM` and `SIGINT` signals
2. Stops accepting new connections
3. Stops all Web3 services
4. Closes database connections
5. Exits cleanly

## Performance Considerations

### Polling vs. Subscriptions
The implementation uses polling instead of WebSocket subscriptions for:
- **Reliability**: Doesn't depend on stable WebSocket connection
- **Simplicity**: Works with any RPC provider
- **Resilience**: Easy to recover from network interruptions

### Batch Processing
The effective amount updater processes wills in batches to:
- Prevent RPC rate limiting
- Reduce memory usage
- Handle large numbers of wills gracefully

### Block History
The approval listener starts from 100 blocks in the past to:
- Handle potential chain reorganizations
- Recover from any missed events
- Ensure data consistency

## Environment Variables

```env
# Required
DATABASE_URL              # PostgreSQL connection string
RPC_URL                   # Ethereum RPC endpoint
CWT_ADDRESS               # ChainWillToken contract address

# Optional (with defaults)
PORT                      # Server port (default: 8000)
APPROVAL_POLL_INTERVAL    # Event polling interval in ms (default: 30000)
EFFECTIVE_AMOUNT_UPDATE_INTERVAL  # Update interval in ms (default: 60000)
MAX_PARALLEL_UPDATES      # Max concurrent calls (default: 5)
```

## Testing

### Manual Testing Approvals
1. Create a will via factory
2. Call `token.approve(willAddress, amount)`
3. Wait for next poll cycle (max 30 seconds)
4. Verify `approvedAmount` updated in database:
   ```sql
   SELECT id, approvedAmount, effectivePullAmount FROM "Will" WHERE id = 'your-will-id';
   ```

### Manual Testing Effective Amount
1. Call `/api/wills/{willId}/refresh-effective-amount` POST endpoint
2. Check response for updated `effectivePullAmount`
3. Verify in database that both `approvedAmount` and `effectivePullAmount` are correct

### Viewing Event History
```bash
curl http://localhost:8000/api/wills/{willId}/approval-history?limit=20
```

## Best Practices Implemented

✅ **Error Resilience**: Services continue operating even if individual operations fail
✅ **Rate Limiting**: Batch processing prevents RPC overload
✅ **Audit Trail**: All events recorded in database for verification
✅ **Graceful Shutdown**: Proper cleanup on process termination
✅ **Monitoring**: Comprehensive logging at every step
✅ **Type Safety**: Full TypeScript types throughout
✅ **Configuration**: Environment-based configuration for flexibility
✅ **Scalability**: Approach scales to handle many wills efficiently
✅ **Separation of Concerns**: Each service has a single responsibility
✅ **Documentation**: Clear comments and this guide

## Deployment Checklist

- [ ] Set `DATABASE_URL` and `DIRECT_URL` environment variables
- [ ] Set `RPC_URL` to appropriate Ethereum RPC provider
- [ ] Verify `CWT_ADDRESS` matches deployed token address
- [ ] Adjust polling intervals based on needs and RPC rate limits
- [ ] Test with small number of wills first
- [ ] Monitor logs during initial deployment
- [ ] Set up log aggregation/monitoring for production
- [ ] Configure alerts for service failures
- [ ] Set up database backups (if not already done)

## Troubleshooting

### Services not starting
Check that:
- `RPC_URL` is accessible
- `DATABASE_URL` is valid and database is running
- `CWT_ADDRESS` is correct on the configured network

### Approval events not appearing
- Check event logs for polling errors
- Verify approval was called on CWT contract
- Verify spender address matches a deployed will address
- Increase `APPROVAL_POLL_INTERVAL` if RPC is being rate-limited

### Effective amount not updating
- Check database connection
- Verify will contract address in database is correct
- Check for RPC errors in logs
- Manually trigger update via endpoint to test

## Future Improvements

1. **Event subscriptions**: Switch to WebSocket subscriptions when available
2. **Caching**: Cache will contract ABIs to reduce RPC calls
3. **Batched contract calls**: Use multicall to fetch multiple values in one call
4. **Metrics**: Add Prometheus metrics for monitoring
5. **Database events**: Use Prisma hooks for additional tracking
6. **Queue-based processing**: Use BullMQ for more robust job handling
