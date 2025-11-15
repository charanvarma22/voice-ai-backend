# 📞 Automatic Phone Number Allocation

## Overview

When a user subscribes to a paid plan (Pro or Business), the system automatically allocates a phone number for them. This happens seamlessly during the subscription validation process.

## How It Works

### Trigger
- User validates StoreKit receipt via `POST /billing/validate`
- System detects:
  - User is subscribing to a **paid plan** (pro/business)
  - User is **upgrading from free** (new subscription or expired)
  - User **doesn't already have** a phone number

### Process
1. **Subscription Validation**
   - Validate receipt with Apple
   - Store subscription in database
   - Determine if this is a new paid subscription

2. **Auto-Allocation** (if conditions met)
   - Check if user already has a number (skip if yes)
   - Search for available Twilio numbers
   - Purchase the number
   - Configure webhooks automatically
   - Store in database
   - Return number info in response

3. **Error Handling**
   - If allocation fails, subscription still succeeds
   - Error is logged but doesn't block subscription
   - User can manually purchase number later

## Configuration

### Environment Variables

Add to `.env`:

```bash
# Enable/disable auto-allocation (default: true)
AUTO_ALLOCATE_NUMBER_ON_SUBSCRIBE=true

# Default country for number allocation (default: US)
DEFAULT_PHONE_COUNTRY=US
```

### Disable Auto-Allocation

Set in `.env`:
```bash
AUTO_ALLOCATE_NUMBER_ON_SUBSCRIBE=false
```

## Request Parameters

When calling `POST /billing/validate`, you can optionally specify:

```json
{
  "receipt_data": "...",
  "transaction_id": "...",
  "areaCode": "415",  // Optional: preferred area code
  "country": "US"     // Optional: country (default: US)
}
```

If `areaCode` is provided, the system will try to find a number in that area code first. If none available, it falls back to any available number in the country.

## API Response

When a number is allocated, the response includes:

```json
{
  "subscription": { ... },
  "validated": true,
  "numberAllocated": true,
  "phoneNumber": {
    "id": "uuid",
    "phone_e164": "+14155551234",
    "twilio_sid": "PN..."
  }
}
```

If allocation is skipped (user already has number):
```json
{
  "subscription": { ... },
  "validated": true,
  "numberAllocated": false,
  "phoneNumber": null
}
```

## Behavior

### When Number IS Allocated
- ✅ New user subscribes to Pro/Business
- ✅ Free user upgrades to Pro/Business
- ✅ User with expired subscription renews

### When Number IS NOT Allocated
- ❌ User already has a phone number
- ❌ User subscribes to Free plan
- ❌ `AUTO_ALLOCATE_NUMBER_ON_SUBSCRIBE=false`
- ❌ No numbers available in Twilio (rare)

## Manual Allocation

Users can still manually purchase numbers via:
```bash
POST /numbers/purchase
{
  "areaCode": "415",
  "country": "US"
}
```

## Webhook Configuration

Auto-allocated numbers are automatically configured with:
- **Voice Webhook**: `${APP_BASE_URL}/webhook/twilio/voice`
- **Status Callback**: `${APP_BASE_URL}/webhook/twilio/status`

These are set during number purchase, so calls work immediately.

## Cost Considerations

- **Twilio charges** apply for number purchase (~$1/month per number)
- **Number is linked to user** - if subscription expires, consider releasing number
- **Free tier users** don't get auto-allocated numbers

## Future Enhancements

- [ ] Release number when subscription expires
- [ ] Allow user to choose area code during subscription
- [ ] Support multiple countries based on user location
- [ ] Pool numbers for better cost management

