# Stellar Smart Contract Integration

## Overview

This integration connects the Chioma backend with Stellar smart contracts for decentralized rental agreement management. All agreement lifecycle operations are mirrored on-chain for transparency and immutability.

## Architecture

### Components

1. **ChiomaContractService** - Direct interface to Stellar smart contracts
2. **BlockchainEventService** - Listens for on-chain events
3. **BlockchainSyncService** - Maintains consistency between database and blockchain
4. **AgreementsService** - Enhanced with blockchain operations

### Data Flow

```
Client Request → AgreementsService → Database + ChiomaContractService → Stellar Network
                                   ↓
                            Atomic Transaction
                                   ↓
                    Success: Both committed | Failure: Both rolled back
```

## Configuration

### Environment Variables

```bash
# Network Configuration
STELLAR_NETWORK=testnet                              # testnet or mainnet
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org # Soroban RPC endpoint
CHIOMA_CONTRACT_ID=CXXX...                           # Deployed contract address

# Admin Wallet
STELLAR_ADMIN_SECRET_KEY=SXXX...                     # Admin secret key for contract calls
```

### Setup

1. Deploy Chioma contract to Stellar testnet/mainnet
2. Fund admin account with XLM for transaction fees
3. Set environment variables
4. Run database migrations: `npm run migration:run`
5. Install dependencies: `npm install`

## API Integration

### Creating Agreements

```typescript
// Automatically creates on-chain agreement
const agreement = await agreementsService.create({
  propertyId: 'prop-123',
  landlordId: 'user-456',
  tenantId: 'user-789',
  landlordStellarPubKey: 'GXXX...',
  tenantStellarPubKey: 'GYYY...',
  monthlyRent: '1000',
  securityDeposit: '2000',
  agentCommissionRate: 10,
  startDate: '2026-03-01T00:00:00Z',
  endDate: '2027-03-01T00:00:00Z',
  termsAndConditions: 'Standard lease terms',
  paymentToken: 'NATIVE',
});

// Returns agreement with blockchain fields populated
console.log(agreement.blockchainAgreementId); // CHIOMA-2026-0001
console.log(agreement.transactionHash);        // tx hash
console.log(agreement.blockchainSyncedAt);     // timestamp
```

### Blockchain Fields

New fields added to `RentAgreement` entity:

- `blockchainAgreementId` - Unique on-chain identifier
- `onChainStatus` - Current status from smart contract
- `transactionHash` - Last blockchain transaction hash
- `blockchainSyncedAt` - Last sync timestamp
- `paymentSplitConfig` - Payment distribution configuration

## Smart Contract Methods

### create_agreement

Creates a new rental agreement on-chain.

**Parameters:**
- `agreement_id`: Unique identifier (e.g., "CHIOMA-2026-0001")
- `landlord`: Landlord's Stellar address
- `tenant`: Tenant's Stellar address
- `agent`: Optional agent address
- `monthly_rent`: Rent amount in stroops (1 XLM = 10^7 stroops)
- `security_deposit`: Deposit amount in stroops
- `start_date`: Unix timestamp
- `end_date`: Unix timestamp
- `agent_commission_rate`: Percentage (0-100)
- `payment_token`: Asset address or "NATIVE"

**Authorization:** Tenant must sign

### sign_agreement

Tenant signs the agreement (Pending → Active).

**Parameters:**
- `tenant`: Tenant's Stellar address
- `agreement_id`: Agreement identifier

**Authorization:** Tenant must sign

### submit_agreement

Landlord submits draft for tenant signature (Draft → Pending).

**Parameters:**
- `landlord`: Landlord's Stellar address
- `agreement_id`: Agreement identifier

**Authorization:** Landlord must sign

### cancel_agreement

Cancel agreement in Draft or Pending state.

**Parameters:**
- `caller`: Landlord's Stellar address
- `agreement_id`: Agreement identifier

**Authorization:** Landlord must sign

### get_agreement

Retrieve agreement data from blockchain.

**Parameters:**
- `agreement_id`: Agreement identifier

**Returns:** Agreement struct with all fields

### has_agreement

Check if agreement exists on-chain.

**Parameters:**
- `agreement_id`: Agreement identifier

**Returns:** Boolean

### get_agreement_count

Get total number of agreements created.

**Returns:** Number

### get_payment_split

Calculate payment distribution for a specific month.

**Parameters:**
- `agreement_id`: Agreement identifier
- `month`: Month number (1-12)

**Returns:** PaymentSplit with landlord and agent amounts

## Error Handling

### Transaction Failures

The service implements automatic rollback on blockchain failures:

```typescript
try {
  // Create database record
  const agreement = await this.agreementRepository.save(newAgreement);
  
  // Create on-chain agreement
  const txHash = await this.chiomaContract.createAgreement(params);
  
  // Update with blockchain data
  agreement.transactionHash = txHash;
  await this.agreementRepository.save(agreement);
} catch (error) {
  // Rollback database changes
  await this.agreementRepository.remove(agreement);
  throw new BadRequestException(`Blockchain error: ${error.message}`);
}
```

### Retry Logic

Failed transactions are retried with exponential backoff:

```typescript
private async pollTransactionStatus(hash: string, maxAttempts = 10): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const txResponse = await this.server.getTransaction(hash);
    
    if (txResponse.status === 'SUCCESS') return hash;
    if (txResponse.status === 'FAILED') throw new Error('Transaction failed');
  }
  
  throw new Error('Transaction timeout');
}
```

## Event System

### Event Types

- `blockchain.AgreementCreated` - New agreement created
- `blockchain.AgreementSigned` - Tenant signed agreement
- `blockchain.AgreementSubmitted` - Landlord submitted for signature
- `blockchain.AgreementCancelled` - Agreement cancelled

### Event Handlers

```typescript
@OnEvent('blockchain.AgreementCreated')
async handleAgreementCreated(event: BlockchainEvent) {
  await this.blockchainSync.syncAgreementWithBlockchain(event.agreementId);
}
```

## Testing

### Unit Tests

```bash
npm test -- chioma-contract.service.spec.ts
```

### Integration Tests

```bash
# Requires testnet setup
npm run test:e2e -- blockchain-integration.e2e-spec.ts
```

### Test Coverage Targets

- ChiomaContractService: 95%+
- BlockchainSyncService: 90%+
- AgreementsService (blockchain features): 90%+

## Monitoring

### Health Checks

```typescript
// Check blockchain connectivity
const isHealthy = await chiomaContractService.checkHealth();
```

### Metrics to Track

- Contract call latency (target: <2s)
- Transaction success rate (target: >99.9%)
- Event processing lag (target: <500ms)
- Sync accuracy (target: 100%)

### Logging

All blockchain operations are logged with context:

```typescript
this.logger.log(`Created on-chain agreement ${agreementId}, tx: ${txHash}`);
this.logger.error(`Failed to create agreement: ${error.message}`, error.stack);
```

## Security

### Key Management

- Admin keys stored in environment variables
- Never expose private keys in logs or responses
- Use separate keys for testnet and mainnet
- Implement key rotation policies

### Authorization

All contract methods enforce proper authorization:
- Tenant must sign `create_agreement` and `sign_agreement`
- Landlord must sign `submit_agreement` and `cancel_agreement`

## Performance Optimization

### Gas Optimization

- Batch operations where possible
- Use simulation before actual transactions
- Monitor transaction fees

### Caching

- Cache contract data with TTL
- Invalidate on blockchain events

## Deployment

### Testnet Deployment

1. Deploy contract: `cd contract && stellar contract deploy`
2. Initialize contract: Call `initialize()` with admin address
3. Update `CHIOMA_CONTRACT_ID` in `.env`
4. Run migrations: `npm run migration:run`
5. Test integration: `npm run test:e2e`

### Mainnet Deployment

1. Audit smart contract code
2. Deploy to mainnet with production keys
3. Update environment variables
4. Monitor closely for first 24 hours
5. Set up alerting for failures

## Troubleshooting

### Common Issues

**"Transaction timeout"**
- Increase `maxAttempts` in `pollTransactionStatus`
- Check RPC endpoint health
- Verify network connectivity

**"Insufficient balance"**
- Fund admin account with XLM
- Check transaction fees

**"Agreement already exists"**
- Verify agreement number uniqueness
- Check for duplicate submissions

**"Data inconsistency"**
- Run sync service: `await blockchainSync.syncAgreementWithBlockchain(id)`
- Check event processing logs

## Future Enhancements

- [ ] Multi-signature support for high-value agreements
- [ ] Automated payment scheduling
- [ ] Dispute resolution integration
- [ ] Cross-chain bridge support
- [ ] Advanced analytics dashboard
