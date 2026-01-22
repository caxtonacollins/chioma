#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String};

use crate::types::{DataKey, Error, PaymentRecord, RentAgreement};

#[contract]
pub struct ChiomaContract;

#[contractimpl]
impl ChiomaContract {
    /// Initializes the protocol with an admin address and resets all counters.
    /// Can only be called once.
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }

        // Persist admin
        env.storage().instance().set(&DataKey::Admin, &admin);

        // Initialize counters to 0
        env.storage()
            .instance()
            .set(&DataKey::AgreementCount, &0u32);
        env.storage().instance().set(&DataKey::PaymentCount, &0u32);
        env.storage().instance().set(&DataKey::DisputeCount, &0u32);

        Ok(())
    }

    /// Returns the current protocol version for auditing and tooling.
    pub fn version(env: Env) -> String {
        String::from_str(&env, "1.0.0")
    }

    /// Internal helper to check if contract is initialized (for future use)
    fn check_initialized(env: &Env) -> Result<(), Error> {
        if !env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::NotInitialized);
        }
        Ok(())
    }

    /// Get a specific payment record by payment_id
    pub fn get_payment(env: Env, payment_id: String) -> Result<PaymentRecord, Error> {
        let key = DataKey::Payment(payment_id);
        env.storage()
            .instance()
            .get(&key)
            .ok_or(Error::PaymentNotFound)
    }

    /// Get total payment count across all agreements
    pub fn get_payment_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::PaymentCount)
            .unwrap_or(0)
    }

    /// Get total amount paid for an agreement
    pub fn get_total_paid(env: Env, agreement_id: String) -> Result<i128, Error> {
        let key = DataKey::Agreement(agreement_id);
        let agreement: RentAgreement = env
            .storage()
            .instance()
            .get(&key)
            .ok_or(Error::AgreementNotFound)?;

        Ok(agreement.total_paid)
    }
}
mod test;
mod types;
