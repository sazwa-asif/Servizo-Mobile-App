# Servizo Mobile

React Native (Expo) mobile app for **Servizo – Skilled Hands, Smart Service**.

## Run

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (SDK 58) or press `w` for web preview.

## Screens

**Customer**

1. **Book a Service** – pick a service, describe the problem, offer a price, choose a date and address.
2. **My Bookings** – every booking with its status and provider; cancel until the job starts.

**Provider**

1. **My Jobs** – one table with new customer offers for the provider's service and the provider's own jobs. Accept an offer, then mark it Complete.

## Project Structure

```text
app/
  _layout.tsx        role-based navigation guards
  index.tsx          landing page
  login.tsx, register.tsx
  jobs.tsx           provider: My Jobs table
  (customer)/        book.tsx, bookings.tsx, tab layout
src/
  data.ts            types, categories, status helpers
  store.tsx          app data and login (AsyncStorage)
  ui.tsx             shared components
  theme.ts           colors
  lib/secureSession.ts   login session in SecureStore (Keychain / Keystore)
```
