#[cfg(test)]
mod test {
    use crate::types::{AgreementStatus, DataKey, PaymentRecord, RentAgreement};
    use crate::{ChiomaContract, ChiomaContractClient};

    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::{Address, Env, String};

    // Added <'_> to the client to satisfy the lifetime requirement
    fn setup_env() -> (Env, ChiomaContractClient<'static>, Address) {
        let env = Env::default();

        // Use .register() instead of the deprecated .register_contract()
        let contract_id = env.register(ChiomaContract, ());
        let client = ChiomaContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        (env, client, admin)
    }

    #[test]
    fn test_initialize_contract() {
        let (env, client, admin) = setup_env();

        client.initialize(&admin);

        assert_eq!(client.version(), String::from_str(&env, "1.0.0"));
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #1)")]
    fn test_cannot_reinitialize() {
        let (_env, client, admin) = setup_env();

        client.initialize(&admin);
        client.initialize(&admin);
    }

    #[test]
    fn test_version() {
        let (env, client, _) = setup_env();
        assert_eq!(client.version(), String::from_str(&env, "1.0.0"));
    }

    #[test]
    fn test_get_payment() {
        let (env, client, admin) = setup_env();
        client.initialize(&admin);

        // Create and store a test payment record
        let payment_id = String::from_str(&env, "payment_1");
        let agreement_id = String::from_str(&env, "agreement_1");
        let payment = PaymentRecord {
            payment_id: payment_id.clone(),
            agreement_id: agreement_id.clone(),
            amount: 1000,
            timestamp: 1234567890,
            payment_number: 1,
        };

        // Store the payment directly in storage
        env.as_contract(&client.address, || {
            env.storage()
                .instance()
                .set(&DataKey::Payment(payment_id.clone()), &payment);
        });

        // Test retrieval
        let retrieved_payment = client.get_payment(&payment_id);
        assert_eq!(retrieved_payment.payment_id, payment_id);
        assert_eq!(retrieved_payment.agreement_id, agreement_id);
        assert_eq!(retrieved_payment.amount, 1000);
        assert_eq!(retrieved_payment.timestamp, 1234567890);
        assert_eq!(retrieved_payment.payment_number, 1);
    }

    #[test]
    #[should_panic(expected = "Error(Contract, #11)")]
    fn test_get_nonexistent_payment() {
        let (env, client, admin) = setup_env();
        client.initialize(&admin);

        let payment_id = String::from_str(&env, "nonexistent_payment");
        client.get_payment(&payment_id);
    }

    #[test]
    fn test_get_payment_count() {
        let (env, client, admin) = setup_env();
        client.initialize(&admin);

        // Initially should be 0
        assert_eq!(client.get_payment_count(), 0);

        // Set payment count to 5
        env.as_contract(&client.address, || {
            env.storage().instance().set(&DataKey::PaymentCount, &5u32);
        });

        // Should now be 5
        assert_eq!(client.get_payment_count(), 5);
    }

    #[test]
    fn test_get_total_paid() {
        let (env, client, admin) = setup_env();
        client.initialize(&admin);

        // Create a test agreement with total_paid = 5000
        let agreement_id = String::from_str(&env, "agreement_1");
        let landlord = Address::generate(&env);
        let tenant = Address::generate(&env);

        let agreement = RentAgreement {
            agreement_id: agreement_id.clone(),
            landlord: landlord.clone(),
            tenant: tenant.clone(),
            agent: None,
            monthly_rent: 1000,
            security_deposit: 2000,
            start_date: 1000000000,
            end_date: 1100000000,
            agent_commission_rate: 500,
            status: AgreementStatus::Active,
            escrow_balance: 2000,
            total_paid: 5000,
            last_payment_date: 1234567890,
        };

        // Store the agreement directly in storage
        env.as_contract(&client.address, || {
            env.storage()
                .instance()
                .set(&DataKey::Agreement(agreement_id.clone()), &agreement);
        });

        // Test retrieval
        let total_paid = client.get_total_paid(&agreement_id);
        assert_eq!(total_paid, 5000);
    }
}
