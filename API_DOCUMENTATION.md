# Voice AI Backend API Documentation

## Base URL
```
Production: https://api.yourapp.com/v1
Development: http://localhost:8080
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <supabase_session_token>
```

Get the token from `/register` or `/login` response (`session.access_token`).

---

## Endpoints

### Authentication

#### `POST /register`
Create a new account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "businessName": "Acme Corp",
  "phoneNumber": "+15551234567",
  "timeZone": "America/New_York"
}
```

**Response:**
```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "...",
    "expires_at": 1234567890
  }
}
```

#### `POST /login`
Sign in with email/password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** Same as `/register`

#### `POST /auth/apple`
Sign in with Apple ID token.

**Request:**
```json
{
  "id_token": "eyJ..."
}
```

**Response:** Same as `/register`

---

### Phone Numbers

#### `POST /numbers/purchase`
Purchase a Twilio phone number.

**Request:**
```json
{
  "areaCode": "415",
  "country": "US"
}
```

**Response:**
```json
{
  "number": {
    "id": "uuid",
    "phone_e164": "+14155551234",
    "twilio_sid": "PN...",
    "user_id": "uuid"
  },
  "twilioSid": "PN..."
}
```

#### `GET /numbers`
List all user's phone numbers.

**Response:**
```json
{
  "numbers": [
    {
      "id": "uuid",
      "phone_e164": "+14155551234",
      "twilio_sid": "PN...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `DELETE /numbers/:id`
Release a phone number.

**Response:**
```json
{ "ok": true }
```

#### `PATCH /numbers/:id/config`
Update webhook URLs for a number.

**Request:**
```json
{
  "voiceUrl": "https://api.yourapp.com/webhook/twilio/voice",
  "statusCallback": "https://api.yourapp.com/webhook/twilio/status"
}
```

---

### Agent Configuration

#### `GET /agent`
Get active agent configuration.

**Response:**
```json
{
  "agent": {
    "id": "uuid",
    "name": "Default Agent",
    "voice_provider": "elevenlabs",
    "voice_id": "voice_id_here",
    "persona_prompt": "You are a polite AI receptionist...",
    "greeting_text": "Hello, thank you for calling...",
    "is_active": true
  }
}
```

#### `POST /agent`
Create or update agent configuration.

**Request:**
```json
{
  "name": "Sales Agent",
  "voice_provider": "elevenlabs",
  "voice_id": "abc123",
  "persona_prompt": "You are a friendly sales assistant...",
  "greeting_text": "Hello, thanks for calling Acme Corp!",
  "is_active": true
}
```

#### `PATCH /agent/:id`
Update specific agent.

**Request:** Same as POST `/agent`

---

### Business Hours

#### `GET /business-hours`
Get business hours configuration.

**Response:**
```json
{
  "businessHours": {
    "timezone": "America/New_York",
    "monday_enabled": true,
    "monday_start": "09:00",
    "monday_end": "17:00",
    ...
  }
}
```

#### `POST /business-hours`
Create or update business hours.

**Request:**
```json
{
  "timezone": "America/New_York",
  "monday": {
    "enabled": true,
    "start": "09:00",
    "end": "17:00"
  },
  "tuesday": { "enabled": true, "start": "09:00", "end": "17:00" },
  ...
}
```

---

### Calls

#### `GET /calls`
List user's call history.

**Response:**
```json
{
  "calls": [
    {
      "id": "uuid",
      "from_number": "+15551234567",
      "to_number": "+14155551234",
      "status": "completed",
      "duration_seconds": 120,
      "started_at": "2024-01-01T10:00:00Z",
      "ended_at": "2024-01-01T10:02:00Z"
    }
  ]
}
```

#### `GET /call/:id`
Get call details with transcript.

**Response:**
```json
{
  "call": { ... },
  "transcript": {
    "transcript": "Full transcript text...",
    "summary": "AI-generated summary...",
    "action_items": ["Follow up tomorrow", "Send quote"]
  },
  "audioFiles": [
    {
      "id": "uuid",
      "storage_path": "call_123/recording.mp3",
      "content_type": "audio/mpeg"
    }
  ]
}
```

#### `POST /summarize-call`
Generate summary from transcript text.

**Request:**
```json
{
  "transcript": "Call transcript text..."
}
```

**Response:**
```json
{
  "summary": "AI-generated summary..."
}
```

#### `POST /upload-audio`
Upload audio file for transcription.

**Request:**
```json
{
  "callId": "uuid",
  "base64": "base64_encoded_audio_data"
}
```

---

### Device Registration (Push Notifications)

#### `POST /device/register`
Register device token for push notifications.

**Request:**
```json
{
  "device_token": "apns_device_token_here",
  "platform": "ios",
  "app_version": "1.0.0"
}
```

**Response:**
```json
{
  "device": {
    "id": "uuid",
    "device_token": "...",
    "platform": "ios",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### `DELETE /device/:token`
Unregister device.

**Response:**
```json
{ "ok": true }
```

---

### Billing / Subscriptions

#### `POST /billing/validate`
Validate StoreKit receipt. **Automatically allocates a phone number for new paid subscribers.**

**Request:**
```json
{
  "receipt_data": "base64_receipt_data",
  "transaction_id": "1000000123456789",
  "areaCode": "415",  // Optional: preferred area code for auto-allocated number
  "country": "US"     // Optional: country for auto-allocated number (default: US)
}
```

**Response:**
```json
{
  "subscription": {
    "plan_name": "pro",
    "is_active": true,
    "expires_at": "2024-02-01T00:00:00Z"
  },
  "validated": true,
  "numberAllocated": true,
  "phoneNumber": {
    "id": "uuid",
    "phone_e164": "+14155551234",
    "twilio_sid": "PN..."
  }
}
```

**Note:** Phone number is automatically allocated when:
- User subscribes to a paid plan (pro/business)
- User doesn't already have a phone number
- `AUTO_ALLOCATE_NUMBER_ON_SUBSCRIBE=true` in environment (default: true)

#### `GET /billing/subscription`
Get current subscription status.

**Response:**
```json
{
  "subscription": {
    "plan_name": "pro",
    "is_active": true,
    "expires_at": "2024-02-01T00:00:00Z"
  }
}
```

---

### Daily Recap

#### `POST /recap/daily`
Generate and send daily recap.

**Response:**
```json
{
  "recap": {
    "date": "2024-01-01",
    "totalCalls": 5,
    "missedCalls": 1,
    "actionItems": ["Follow up with John", "Send quote"],
    "calls": [...]
  }
}
```

---

### Webhooks (Public - No Auth)

#### `POST /webhook/twilio/voice`
Twilio voice webhook. Configure in Twilio console.

**Query Params:**
- `?mode=voicemail` - Use voicemail mode instead of AI agent

#### `POST /webhook/twilio/recording`
Recording status callback from Twilio.

#### `POST /webhook/twilio/status`
Call status callback from Twilio.

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message here"
}
```

**Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

---

## Environment Variables (iOS Dev)

For iOS app configuration, you only need:

- `BACKEND_API_URL` - Base API URL (e.g., `https://api.yourapp.com/v1`)
- `SUPABASE_URL` - For Supabase Auth (if using client-side)
- `SUPABASE_ANON_KEY` - For Supabase Auth (if using client-side)

**Note:** Never share `SUPABASE_SERVICE_ROLE_KEY`, `TWILIO_AUTH_TOKEN`, or `OPENAI_API_KEY` with frontend.

---

## Next Steps for iOS Developer

1. Use Supabase Auth SDK for login/register
2. Store `session.access_token` securely (Keychain)
3. Include token in all API requests: `Authorization: Bearer <token>`
4. Implement CallKit for incoming calls
5. Register device token with `/device/register` after login
6. Validate StoreKit receipts with `/billing/validate`

