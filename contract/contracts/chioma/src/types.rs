use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AgreementStatus {
    Draft,
    Active,
    Completed,
    Terminated,
    Disputed,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RentAgreement {
    pub agreement_id: String,
    pub landlord: Address,
    pub tenant: Address,
    pub agent: Option<Address>,
    pub monthly_rent: i128,
    pub security_deposit: i128,
    pub property_id: BytesN<32>,
    pub rent_amount: i128,
    pub payment_token: Address,
    pub terms_hash: BytesN<32>,
    pub created_at: u64,
    pub signed_at: Option<u64>,
    pub start_date: u64,
    pub end_date: u64,
    pub agent_commission_rate: u32,
    pub status: AgreementStatus,
// Payment and agreement related errors
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AgreementNotActive = 10,
    InvalidAmount = 11,
    PaymentFailed = 12,
}

// Payment record structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PaymentRecord {
    pub agreement_id: String,
    pub payment_number: u32,
    pub amount: i128,
    pub landlord_amount: i128,
    pub agent_amount: i128,
    pub timestamp: u64,
    pub tenant: Address,
}

// Agreement status enum
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AgreementStatus {
    Pending,
    Active,
    Completed,
    Cancelled,
}

// Agreement structure
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Agreement {
    pub id: String,
    pub tenant: Address,
    pub landlord: Address,
    pub agent: Option<Address>,
    pub monthly_rent: i128,
    pub commission_rate: u32, // basis points
    pub status: AgreementStatus,
    pub total_rent_paid: i128,
    pub payment_count: u32,
}

// Storage keys used by the contract
#[contracttype]
pub enum DataKey {
    Agreement(String),
    PaymentRecord(String, u32), // (agreement_id, payment_number)
}
