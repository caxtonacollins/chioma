# Anchor Integration (SEP-0024)

This module implements SEP-0024 protocol for fiat on/off ramps through Stellar Anchors.

## Features

- **Deposit Flow**: Convert fiat to USDC on Stellar
- **Withdrawal Flow**: Convert USDC to fiat
- **Transaction Status Tracking**: Real-time status updates
- **Multiple Payment Methods**: SEPA, SWIFT, ACH support
- **Webhook Support**: Automatic status updates from anchors

## API Endpoints

### Deposit
```
POST /api/v1/anchor/deposit
{
  "amount": 100,
  "currency": "USD",
  "walletAddress": "GTEST123...",
  "type": "ACH"
}
```

### Withdrawal
```
POST /api/v1/anchor/withdraw
{
  "amount": 50,
  "currency": "USD",
  "destination": "bank-account-123",
  "walletAddress": "GTEST123..."
}
```

### Transaction Status
```
GET /api/v1/anchor/transactions/:id
```

### User Transactions
```
GET /api/v1/anchor/transactions?walletAddress=GTEST123...
```

## Configuration

Add to your `.env` file:

```env
ANCHOR_API_URL=https://api.anchor-provider.com
ANCHOR_API_KEY=your_api_key
ANCHOR_USDC_ASSET=USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN
SUPPORTED_FIAT_CURRENCIES=USD,EUR,GBP,NGN
```

## Database Schema

The integration adds two new tables:
- `anchor_transactions`: Tracks deposit/withdrawal transactions
- `supported_currencies`: Manages supported fiat currencies

## Security

- All endpoints require JWT authentication
- Wallet address validation
- Rate limiting implemented
- Secure API key storage

## Testing

Run tests with:
```bash
npm test anchor.service.spec.ts
```

## Error Handling

The service handles various error scenarios:
- Invalid anchor responses
- Network timeouts
- Transaction failures
- Status update failures

## Monitoring

Transaction status is automatically updated via:
- Polling mechanism
- Webhook callbacks from anchors
- Manual status checks
