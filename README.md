# QAMPUS

![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react&logoColor=61DAFB)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white)
![EAS](https://img.shields.io/badge/EAS_Build-4630EB?logo=expo&logoColor=white)

A campus queueing app. Students join an office's queue from their phone, offices call people from a staff web console, and a
public display shows who is being served.

## Overview

Waiting in line at a campus office means standing around without knowing when your turn is. QAMPUS replaces the physical line with a
digital one. It has three parts that share one live database:

- **Student and guest app** (Android): browse offices, join a queue, follow your place and get alerted when you are called.
- **Staff console** (web): an office opens its queue, calls the next person, verifies arrival and records the outcome.
- **Public display** (web): a screen at the office showing who is being served now, the next numbers and a QR code for check-in.

## Features

**Students and guests**
- Join an office's queue and follow your live position and estimated wait.
- Up to three active tickets, one per office.
- "It's your turn" alert in the app and as a push notification, with a 60-second grace period to arrive.
- Check in by scanning the office QR code or typing its 6-digit code.
- Ticket history, in-app notifications, and a Bans & Warnings screen for no-shows and cancellations while called.
- Guest access without a school account, and optional biometric unlock.

**Staff**
- Open and close the queue, with a capacity cutoff based on the office's closing time.
- Call next, override the order, verify by ID, complete, mark no-show, or cancel the entire queue.
- Review and revoke offenses, and browse a filterable activity log.

**Public display**
- Now Serving, the next three numbers, the check-in QR code and a closed state, without showing names.

## Download and try it

1. **Install the app.** Download `qampus.apk` from the [v1.0.0 release](https://github.com/Az-Zav/QAMPUS/releases/tag/V1.0.0) (or the [latest release](https://github.com/Az-Zav/QAMPUS/releases/latest)) on an Android phone and open it. If
   Android asks, allow installing apps from this source.
2. **Sign in.**
   - Students use Google sign-in with a `@tip.edu.ph` account.
   - Anyone else can choose **Continue as guest**, fill in the short form, and use the app like a student.
3. **Join a queue.** Open an office from the Offices tab and tap Join. Your ticket appears on the Home tab.
4. **Open the staff console** at https://qampus-staff.web.app to call tickets. Staff sign in with Google, and the account must be
   registered as staff for an office. To request staff access, open an issue on this repository's
   [Issues page](../../issues). No credentials are published here.
5. **Public display.** From the staff console's Queue screen, choose **Launch public display**.

## Tech stack

| Area | Technology |
|---|---|
| Mobile app | Expo, React Native, Expo Router |
| Staff console and display | Expo web (React Native for Web) |
| Backend | Firebase Authentication and Firestore (Spark plan, no Cloud Functions), secured by Firestore Security Rules |
| Push notifications | Expo Notifications, sent through a small Cloudflare Worker (`relay/`) |
| Builds and updates | EAS Build and EAS Update |
| Hosting | Firebase Hosting (staff console) |

## Project layout

| Folder | What it is |
|---|---|
| `apps/mobile` | Student and guest app. |
| `apps/staff` | Staff web console and public display. |
| `packages/backend` | `@qampus/backend`: the shared Firestore layer (ticketing, penalties, events, notifications), unit tested. |
| `packages/core` | `@qampus/core`: shared enums, formats and the program list. |
| `packages/ui` | `@qampus/ui`: shared components and theme tokens. |
| `relay/` | Cloudflare Worker that sends push notifications for staff calls. |
| `firestore.rules`, `firestore.indexes.json` | Database Security Rules and indexes. |
| `docs/` | Project status, decisions and schema. The product spec is `KnowledgeBase/QAMPUS_PRD.md`. |

## For developers

The source is configured for the team's own Firebase project (Authentication, Firestore, the Google sign-in client and the EAS
account). It is not set up to be cloned and pointed at another project, so running it from source is not supported. Use the APK and
the hosted staff console above.

## License

See [LICENSE](LICENSE).
