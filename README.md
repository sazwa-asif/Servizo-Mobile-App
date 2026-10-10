# Servizo Mobile

React Native (Expo) mobile app for **Servizo – Skilled Hands, Smart Service**, built from the web app's UI (teal `#0A4C68`, orange `#ff7f2a`, rounded cards, category logos).

## Run

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (SDK 57). Press `w` for a quick web preview (date/time use text inputs on web; photo picker, camera and GPS need a phone).

## Demo accounts

| Role     | Email                  | Password   |
| -------- | ---------------------- | ---------- |
| Customer | customer@servizo.app   | demo1234   |
| Provider | provider@servizo.app   | demo1234   |

The login screen has one-tap buttons to fill these in. You can also register new customer/provider accounts.

## Features

- **Service discovery** – categories, search, category filter, sorting, provider list
- **Provider profiles** – services offered, experience, service area, rating, completed jobs, reviews
- **Service request** – choose service, describe problem, upload photos (gallery/camera), pick date & time, service location (typed or current GPS)
- **Booking management** – provider accepts/rejects; customer cancels or reschedules; upcoming and past tabs
- **Status tracking** – Requested → Accepted → Scheduled → In Progress → Completed
- **Service history** – past bookings with details, photos, status timeline, and a review after completion
- **Auth & roles** – customer and provider experiences, role-based navigation
- **Notifications** – in-app notification centre with unread badge for every booking event
- **Maps** – "Open in Maps" for the service location

## Structure

```
app/            expo-router screens ((auth), (customer), (provider), booking, request, provider)
src/store/      AppContext – local data layer (AsyncStorage), all screens go through it
src/data/       types + seed data
src/components/ shared UI
src/lib/        status flow + date helpers, images
```

## Backend note

There is no server yet. `src/store/AppContext.tsx` is a local stand-in for the REST API + database (data persists on the device via AsyncStorage, passwords are stored in plain text there — **mock only**). When the backend exists, replace the action functions in that file with API calls; the screens don't need to change.
