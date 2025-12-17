---
title:
draft: false
tags:
date: 2025-12-12
---
## Background: Compliance-Driven Payment Systems

Payments are compliance-driven systems because they handle real money and sensitive user data.

Regulations such as PCI DSS and local data protection laws strongly constrain how payment flows are designed.
    
These requirements heavily influence **how a system integrates with third-party Payment Service Providers (PSPs)**.

--- 
## Two Integration Models with PSPs

### 1. Hosted Payment Page (Redirect / Embedded UI)

- The PSP *renders their own payment page directly* to the user
- User credentials (card numbers, passwords, CVV) never pass through your platform
- Data flows directly from user to PSP
- Advantage: Lower compliance burden since you don't handle sensitive payment data
- Disadvantage: Higher transaction fees from the PSP

### 2. API-Based Integration (Direct Processing)

- Users enter payment information on your platform's interface
- Your system collects the data, packages it into API requests, and sends to PSP
- Requires building CRUD logic and payment processing flows on your side
- Advantage: Significantly lower transaction costs
- Disadvantage: Strict compliance requirements (PCI DSS, tokenization, encryption)

---
## Compliance Implications

To legally and safely support API-based payment processing, the platform must prove that it can securely handle user data.

### Key Compliance Standards

- **PCI DSS (Payment Card Industry Data Security Standard)**: Required for any system that stores, processes, or transmits cardholder data
- **Data encryption**: Both in transit (TLS/SSL) and at rest
- **Tokenization**: Replace sensitive card data with non-sensitive tokens after initial capture
- **Access controls**: Restrict who can access payment data within your organization
- **Audit logging**: Track all payment-related operations
- **Regular security assessments**: Penetration testing and vulnerability scans

### Why Compliance Matters

- Proves your system can safely process user payment data
- Protects user privacy and financial information
- Avoids legal penalties and maintains business licenses
- Enables lower-cost PSP integration options

---
## Payment Flow State Machine

The payment process consists of several stages with clear state transitions:

### ### Stage 1: Pre-Payment (Initialization)

**State**: `INITIATED` or `PENDING`

- User selects items/services to purchase
- System creates a payment session/order record
- Calculates total amount, taxes, fees
- Generates unique transaction ID
- May perform preliminary fraud checks
- Determines which PSP to route to based on user location, payment method, or business rules

**Key operations**:

- Order validation
- Price calculation
- Session creation
- Currency conversion (if needed)

### Stage 2: Payment Processing (Data Collection & Submission)

**State**: `PROCESSING` or `AUTHORIZING`

- User enters payment details (card number, expiry, CVV, billing address)
- **For direct redirect**: User is redirected to PSP's page
- **For API integration**:
    - Your frontend securely captures the data (ideally using PSP's SDK/iframe to minimize PCI scope)
    - Data is tokenized immediately
    - Encrypted API request sent to PSP with tokenized data
- PSP performs authorization with card networks (Visa, Mastercard, etc.)
- May trigger 3D Secure (3DS) authentication for additional security
- Bank approves or declines the transaction`

**Key operations**:

- Data validation and sanitization
- Tokenization
- Encryption
- PSP API call
- 3D Secure flow handling
- Fraud detection checks

### Stage 3: Post-Payment (Confirmation & Fulfillment)

**State**: `AUTHORIZED` → `CAPTURED` → `COMPLETED`

- PSP sends callback/webhook to your system with transaction result
- **Success path**:
    - Update transaction status to `AUTHORIZED` (funds reserved but not yet transferred)
    - Capture the payment (actual fund transfer, may be immediate or delayed)
    - Trigger fulfillment: deliver virtual goods, unlock content, or update user balance
    - Send confirmation email/notification to user
    - Update order status to `COMPLETED`
    - Record transaction for accounting/reporting
- **Failure path**:
    - Mark transaction as `FAILED` or `DECLINED`
    - Log the error reason
    - Notify user with appropriate error message
    - May allow retry with different payment method

**Additional states to handle**:

- `REFUNDED`: Full or partial refund processed
- `DISPUTED`: Chargeback initiated by user
- `CANCELLED`: Transaction cancelled before completion
- `EXPIRED`: Payment session timed out

### State Transition Considerations

- **Idempotency**: Handle duplicate callbacks/webhooks from PSP
- **Timeout handling**: Set appropriate timeouts for each stage
- **Retry logic**: Implement exponential backoff for API failures
- **Rollback mechanisms**: Undo operations if later stages fail
- **Consistency**: Ensure database transactions maintain data integrity

---
## System Complexity Levels

### Simple: Gaming/Digital Content

- **Flow**: User pays → System receives funds → Deliver virtual goods
- Single-sided transaction
- No need to split payments
- Instant fulfillment possible
- Lower risk of disputes

### Complex: E-commerce Marketplace

- **Flow**: Buyer pays → Platform holds funds → Seller delivers → Platform releases funds to seller
- Two-sided transaction with escrow
- **Additional components needed**:
    - **Escrow system**: Hold funds until delivery confirmation
    - **Split payment logic**: Platform fee + seller payout
    - **Payout system**: Transfer funds to seller's bank account
    - **Dispute resolution**: Handle refunds, chargebacks, seller disputes
    - **Reconciliation**: Match payments with payouts
- May involve different PSPs for collection vs. disbursement
- Regulatory requirements around marketplace operations

---
## Regional Differences & Multi-Provider Strategy

Because:
- Different countries have different regulations
- Different regions prefer different payment methods
    

A global platform must:
- Integrate **multiple PSPs**
- Route payments based on:
    - country
    - currency
    - payment method
    - compliance requirements

This makes **provider abstraction** and **configuration-driven routing** critical design concerns.

---
## System Architecture Components

### Core Components

1. **Payment Gateway Service**: Interfaces with external PSPs
2. **Order Management**: Tracks purchase orders and fulfillment
3. **Transaction Database**: Records all payment events
4. **Tokenization Service**: Securely stores payment methods
5. **Webhook Handler**: Processes PSP callbacks
6. **Fraud Detection**: Monitors suspicious activities
7. **Reconciliation Service**: Matches payments with orders
8. **Reporting & Analytics**: Business intelligence and compliance reporting

### Integration Patterns

- Event-driven architecture for asynchronous processing
- Message queues for reliable webhook processing
- Circuit breakers for PSP failures
- Audit logs for compliance

---

> [!info] See [[HoYoverse Payment Architecture]] for how HoYoverse implements its payment system design and compliance-driven architecture in practice.

