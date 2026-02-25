# Stellar Smart Contract Integration - Quick Reference

## 🚀 Quick Start

```bash
cd /workspaces/chioma/backend
./setup-blockchain-integration.sh
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/modules/stellar/services/chioma-contract.service.ts` | Smart contract interface |
| `src/modules/agreements/blockchain-sync.service.ts` | Sync service |
| `src/modules/agreements/agreements.service.ts` | Enhanced with blockchain |
| `migrations/1740300000000-AddBlockchainFieldsToAgreements.ts` | Database schema |
| `docs/stellar-contract-integration.md` | Full documentation |

## 🔧 Environment Variables

```bash
STELLAR_NETWORK=testnet
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
CHIOMA_CONTRACT_ID=<your-contract-id>
STELLAR_ADMIN_SECRET_KEY=<your-admin-secret>
```

## 📊 Contract Methods

| Method | Purpose | Authorization |
|--------|---------|---------------|
| `createAgreement()` | Create on-chain agreement | Tenant |
| `signAgreement()` | Tenant signs agreement | Tenant |
| `submitAgreement()` | Submit for signature | Landlord |
| `cancelAgreement()` | Cancel agreement | Landlord |
| `getAgreement()` | Retrieve agreement | None |
| `hasAgreement()` | Check existence | None |
| `getAgreementCount()` | Total count | None |
| `getPaymentSplit()` | Calculate splits | None |

## 💻 Usage Example

```typescript
// Create agreement (automatically creates on-chain)
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
  termsAndConditions: 'Standard terms',
  paymentToken: 'NATIVE',
});

// Check blockchain fields
console.log(agreement.blockchainAgreementId); // CHIOMA-2026-0001
console.log(agreement.transactionHash);        // tx hash
console.log(agreement.onChainStatus);          // Draft
```

## 🧪 Testing

```bash
# Unit tests
npm test -- chioma-contract.service.spec.ts

# Integration tests (requires testnet)
npm run test:e2e -- blockchain-integration.e2e-spec.ts

# All tests
npm test
```

## 🔍 Debugging

```bash
# Check RPC health
curl https://soroban-testnet.stellar.org/health

# View logs
tail -f logs/application.log | grep -i blockchain

# Check database
psql -d chioma_db -c "SELECT blockchain_agreement_id, on_chain_status, transaction_hash FROM rent_agreements;"
```

## 📈 Performance Targets

| Metric | Target | Implementation |
|--------|--------|----------------|
| Contract call | <2s | Transaction polling |
| Event processing | <500ms | Async emitter |
| Sync accuracy | 99.9% | Atomic transactions |
| Throughput | 1000+ | Async operations |

## 🐛 Common Issues

### "Transaction timeout"
- Increase polling attempts in `pollTransactionStatus()`
- Check RPC endpoint health
- Verify network connectivity

### "Insufficient balance"
- Fund admin account with XLM
- Check transaction fees

### "Agreement already exists"
- Verify agreement number uniqueness
- Check for duplicate submissions

### "Data inconsistency"
- Run: `await blockchainSync.syncAgreementWithBlockchain(id)`
- Check event processing logs

## 🔗 Resources

- [Full Documentation](docs/stellar-contract-integration.md)
- [Implementation Summary](BLOCKCHAIN_INTEGRATION.md)
- [Stellar Docs](https://developers.stellar.org/)
- [Soroban Docs](https://soroban.stellar.org/)

## 📞 Support

1. Check documentation
2. Review error logs
3. Verify environment configuration
4. Test on testnet first

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Migrations run
- [ ] Contract deployed to testnet
- [ ] Environment variables set
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Ready for mainnet

---

**Quick Links:**
- Setup: `./setup-blockchain-integration.sh`
- Docs: `docs/stellar-contract-integration.md`
- Tests: `npm test`
- Start: `npm run start:dev`
