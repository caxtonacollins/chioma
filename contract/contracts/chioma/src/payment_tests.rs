#![cfg(test)]

use crate::payment::*;
use crate::types::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

// Helper function to create a test agreement
fn create_test_agreement(
    env: &Env,
    id: &str,
    tenant: &Address,
    landlord: &Address,
    agent: Option<Address>,
    monthly_rent: i128,
    commission_rate: u32,
    status: AgreementStatus,
) -> Agreement {
    Agreement {
        id: String::from_str(env, id),
        tenant: tenant.clone(),
        landlord: landlord.clone(),
        agent,
        monthly_rent,
        commission_rate,
        status,
        total_rent_paid: 0,
        payment_count: 0,
    }
}

#[test]
fn test_pay_rent_without_agent() {
    let env = Env::default();
    env.mock_all_auths();

    let tenant = Address::generate(&env);
    let landlord = Address::generate(&env);
    let token = Address::generate(&env);
    
    let agreement = create_test_agreement(
        &env,
        "agreement_1",
        &tenant,
        &landlord,
        None,
        1000,
        0,
        AgreementStatus::Active,
    );

    env.as_contract(&Address::generate(&env), || {
        env.storage()
            .instance()
            .set(&DataKey::Agreement(agreement.id.clone()), &agreement);

        let result = RentalContract::pay_rent(
            env.clone(),
            agreement.id.clone(),
            token,
            1000,
        );

        assert!(result.is_ok());
    });
}

#[test]
fn test_pay_rent_with_agent_commission() {
    let env = Env::default();
    env.mock_all_auths();

    let tenant = Address::generate(&env);
    let landlord = Address::generate(&env);
    let agent = Address::generate(&env);
    let token = Address::generate(&env);
    
    let agreement = create_test_agreement(
        &env,
        "agreement_2",
        &tenant,
        &landlord,
        Some(agent),
        1000,
        500, // 5% commission
        AgreementStatus::Active,
    );

    env.as_contract(&Address::generate(&env), || {
        env.storage()
            .instance()
            .set(&DataKey::Agreement(agreement.id.clone()), &agreement);

        let result = RentalContract::pay_rent(
            env.clone(),
            agreement.id.clone(),
            token,
            1000,
        );

        assert!(result.is_ok());

        // Verify split: 950 to landlord, 50 to agent
        let (landlord_amt, agent_amt) = calculate_payment_split(&1000, &500);
        assert_eq!(landlord_amt, 950);
        assert_eq!(agent_amt, 50);
    });
}

#[test]
fn test_payment_record_created() {
    let env = Env::default();
    env.mock_all_auths();

    let tenant = Address::generate(&env);
    let landlord = Address::generate(&env);
    let token = Address::generate(&env);
    
    let agreement = create_test_agreement(
        &env,
        "agreement_3",
        &tenant,
        &landlord,
        None,
        1000,
        0,
        AgreementStatus::Active,
    );

    env.as_contract(&Address::generate(&env), || {
        env.storage()
            .instance()
            .set(&DataKey::Agreement(agreement.id.clone()), &agreement);

        RentalContract::pay_rent(
            env.clone(),
            agreement.id.clone(),
            token,
            1000,
        ).unwrap();

        // Verify payment record exists
        let record: Option<PaymentRecord> = env
            .storage()
            .instance()
            .get(&DataKey::PaymentRecord(agreement.id.clone(), 1));
        
        assert!(record.is_some());
        let record = record.unwrap();
        assert_eq!(record.amount, 1000);
        assert_eq!(record.payment_number, 1);
    });
}

#[test]
#[should_panic(expected = "InvalidAmount")]
fn test_wrong_rent_amount() {
    let env = Env::default();
    env.mock_all_auths();

    let tenant = Address::generate(&env);
    let landlord = Address::generate(&env);
    let token = Address::generate(&env);
    
    let agreement = create_test_agreement(
        &env,
        "agreement_4",
        &tenant,
        &landlord,
        None,
        1000,
        0,
        AgreementStatus::Active,
    );

    env.as_contract(&Address::generate(&env), || {
        env.storage()
            .instance()
            .set(&DataKey::Agreement(agreement.id.clone()), &agreement);

        // Try to pay wrong amount
        RentalContract::pay_rent(
            env.clone(),
            agreement.id.clone(),
            token,
            900, // Wrong amount
        ).unwrap();
    });
}

#[test]
#[should_panic(expected = "AgreementNotActive")]
fn test_pay_rent_before_deposit() {
    let env = Env::default();
    env.mock_all_auths();

    let tenant = Address::generate(&env);
    let landlord = Address::generate(&env);
    let token = Address::generate(&env);
    
    let agreement = create_test_agreement(
        &env,
        "agreement_5",
        &tenant,
        &landlord,
        None,
        1000,
        0,
        AgreementStatus::Pending, // Not active
    );

    env.as_contract(&Address::generate(&env), || {
        env.storage()
            .instance()
            .set(&DataKey::Agreement(agreement.id.clone()), &agreement);

        RentalContract::pay_rent(
            env.clone(),
            agreement.id.clone(),
            token,
            1000,
        ).unwrap();
    });
}

#[test]
fn test_multiple_rent_payments() {
    let env = Env::default();
    env.mock_all_auths();

    let tenant = Address::generate(&env);
    let landlord = Address::generate(&env);
    let token = Address::generate(&env);
    
    let agreement = create_test_agreement(
        &env,
        "agreement_6",
        &tenant,
        &landlord,
        None,
        1000,
        0,
        AgreementStatus::Active,
    );

    env.as_contract(&Address::generate(&env), || {
        env.storage()
            .instance()
            .set(&DataKey::Agreement(agreement.id.clone()), &agreement);

        // First payment
        RentalContract::pay_rent(
            env.clone(),
            agreement.id.clone(),
            token.clone(),
            1000,
        ).unwrap();

        // Second payment
        RentalContract::pay_rent(
            env.clone(),
            agreement.id.clone(),
            token.clone(),
            1000,
        ).unwrap();

        // Verify agreement totals
        let updated_agreement: Agreement = env
            .storage()
            .instance()
            .get(&DataKey::Agreement(agreement.id.clone()))
            .unwrap();
        
        assert_eq!(updated_agreement.total_rent_paid, 2000);
        assert_eq!(updated_agreement.payment_count, 2);

        // Verify both payment records exist
        let record1: Option<PaymentRecord> = env
            .storage()
            .instance()
            .get(&DataKey::PaymentRecord(agreement.id.clone(), 1));
        let record2: Option<PaymentRecord> = env
            .storage()
            .instance()
            .get(&DataKey::PaymentRecord(agreement.id.clone(), 2));
        
        assert!(record1.is_some());
        assert!(record2.is_some());
    });
}

#[test]
fn test_calculate_payment_split() {
    // Test with no commission
    let (landlord, agent) = calculate_payment_split(&1000, &0);
    assert_eq!(landlord, 1000);
    assert_eq!(agent, 0);

    // Test with 5% commission (500 basis points)
    let (landlord, agent) = calculate_payment_split(&1000, &500);
    assert_eq!(landlord, 950);
    assert_eq!(agent, 50);

    // Test with 10% commission (1000 basis points)
    let (landlord, agent) = calculate_payment_split(&2000, &1000);
    assert_eq!(landlord, 1800);
    assert_eq!(agent, 200);

    // Test with 2.5% commission (250 basis points)
    let (landlord, agent) = calculate_payment_split(&10000, &250);
    assert_eq!(landlord, 9750);
    assert_eq!(agent, 250);
}
