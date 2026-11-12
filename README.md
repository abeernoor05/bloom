# Bloom 🌱

> A gentle habit coach for building routines that last.

Bloom helps you build habits without the guilt. Set goals, track your daily progress, and get kind, adaptive coaching that adjusts to your real life instead of demanding perfection.

## Features

- **Goals and habits**: Organize habits under goals like Health & Fitness, Learning, Productivity, Mental Wellbeing, Sleep and Finance.
- **Flexible schedules**: Daily, specific weekdays, or a weekly target (e.g. 3–4 days a week).
- **Reminders**: Set a reminder time for each habit and get a notification when it's due.
- **Streaks and insights**: See your current and best streaks and your weekly completion rates.
- **Quick reflections**: Missed a day? Tell Bloom why, with no judgment.
- **Adaptive coaching**: Bloom uses your reflections to suggest small changes, like a lighter target, a better reminder time, or a gentler weekly frequency.
- **AI coach**: Ask questions about your habits and get personalized answers and suggestions.
- **Works everywhere**: iOS, Android and web (installable as a PWA).

## Tech Stack

- React Native
- Expo and Expo Router
- TypeScript
- HeroUI Native (UI components)
- Expo Notifications (reminders)
- AsyncStorage (local data persistence)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) and npm
- [Expo Go](https://expo.dev/go) on your phone (optional)

### Installation

```bash
git clone https://github.com/abeernoor05/bloom.git
cd bloom
npm install
```

### Run the app

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `i` (iOS simulator) or `a` (Android emulator). For the web version, press `w`.

## Project Structure

```
app/          Screens and routes (Today, Habits, Insights, Settings, Coach)
components/   Reusable UI components
lib/bloom/    Habit logic: storage, streaks, progress, reminders, coaching
hooks/        Custom React hooks
assets/       Images and fonts
```

## Author

Made by [Abeer Noor](https://github.com/abeernoor05)
