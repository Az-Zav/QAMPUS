// QAMPUS Terms of Service and Privacy Policy (read by app/legal/[doc]).
// A section's blocks are a paragraph (string), a { subheading }, or a { label, text } lead-in.
// **double asterisks** mark a bold term. Bump `updated` whenever the wording changes.
// The text describes what the V1 prototype actually stores; have the school's Data Protection
// Officer review it before a public release.

import { RULES } from './domain';

export const LegalDoc = Object.freeze({
  TERMS: 'terms',
  PRIVACY: 'privacy',
});

const UPDATED = 'October 25, 2026';

export const LEGAL_DOCS = Object.freeze({
  [LegalDoc.TERMS]: {
    navTitle: 'QAMPUS Terms of Service',
    title: 'Terms of Service',
    updated: UPDATED,
    intro: [
      'Welcome to QAMPUS (the **"App"**). These Terms of Service (these **"Terms"**) set out the rules for using the QAMPUS mobile application, the QAMPUS staff console and the public "Now Serving" display (collectively, the **"Services"**). For purposes of these Terms, **"you"** and **"your"** mean you as a user of the Services, and **"we"**, **"us"** and **"our"** mean the QAMPUS team that runs the Services for the campus service offices.',
      'By continuing with Google or continuing as a guest, you agree to these Terms and to our Privacy Policy. If you do not agree, do not use the Services and line up at the office in person instead.',
    ],
    sections: [
      {
        heading: '1. What QAMPUS Does',
        blocks: [
          'QAMPUS lets you hold a place in a campus office queue from your phone. You join a queue, receive a virtual ticket, watch the queue move in real time and walk to the office when your ticket is called. QAMPUS mirrors the office’s existing line: first come, first served, and staff decide when to call the next person.',
          'QAMPUS does not book appointments or guarantee a time of service. Wait estimates are based on how the office has served people so far today and may change.',
        ],
      },
      {
        heading: '2. Your Account',
        blocks: [
          { label: 'Students', text: 'sign in with their school Google account. On first sign-in you enter your student ID and program. Your student ID can be registered to only one account and cannot be changed by you afterwards.' },
          { label: 'Guests', text: 'such as parents, relatives, representatives and alumni continue without a school account. You give your name and guest type, and the App issues you a Guest ID. A guest account lives on the device that created it: if you sign out or uninstall the App, the Guest ID and its tickets cannot be recovered.' },
          'You agree to give true information, to keep your device and account to yourself, and not to use another person’s student ID. You are responsible for what happens under your account.',
        ],
      },
      {
        heading: '3. Joining and Keeping Your Place',
        blocks: [
          `You may hold up to ${RULES.MAX_ACTIVE_TICKETS} active tickets at a time, and only one per office. An office may stop accepting new tickets when it can no longer serve everyone before closing time.`,
          `When your ticket is called, go to the office and check in by scanning the office QR code or typing its code within the ${RULES.GRACE_PERIOD_SECONDS}-second grace period. If you cannot scan, staff can verify you by your student ID or Guest ID.`,
          'You may leave a queue at any time before you are called, free of charge. An office may also cancel its whole queue, for example when it closes early; you will be notified if that happens.',
        ],
      },
      {
        heading: '4. Offenses and Temporary Bans',
        blocks: [
          'Missing your turn after being called (a no-show), or cancelling after you have been called, counts as an offense. Leaving before you are called never counts.',
          `${RULES.OFFENSES_PER_BAN} offenses pause your ability to join queues for ${RULES.BAN_HOURS} hours. During a ban you can still browse offices, your tickets and your history. Office staff may revoke an offense they find was recorded in error; you can see every offense under Bans & Warnings.`,
        ],
      },
      {
        heading: '5. Acceptable Use',
        blocks: [
          'You agree not to: join queues you do not intend to attend in order to hold places for others; share or display an office code to people who are not at the office; interfere with, overload or try to bypass the limits of the Services; use modified or unofficial versions of the App; or access data that is not yours.',
          'We may suspend or remove an account that breaks these Terms, and the school may apply its own rules of conduct.',
        ],
      },
      {
        heading: '6. Office Decisions',
        blocks: [
          'Each office remains in charge of its own service. Staff may call people out of order when needed (for example for priority or urgent cases), mark no-shows, and close or cancel a queue. These actions are recorded with the name of the staff member who took them.',
        ],
      },
      {
        heading: '7. Availability',
        blocks: [
          'QAMPUS is provided "as is" and depends on your internet connection, your device and third-party services such as Google. The Services may be interrupted, changed or discontinued. Keep an eye on the office and the public display, and do not rely on notifications alone. To the extent allowed by law, we are not liable for missed turns, waiting time or losses caused by an outage, a delayed notification or a wrong estimate.',
        ],
      },
      {
        heading: '8. Changes to These Terms',
        blocks: [
          'We may update these Terms. The date at the top shows the latest version. If a change is significant, we will tell you in the App. Continuing to use the Services after a change means you accept the updated Terms.',
        ],
      },
      {
        heading: '9. Contact',
        blocks: [
          'Questions about these Terms can be sent to the campus services team through Help & Support in the App.',
        ],
      },
    ],
  },

  [LegalDoc.PRIVACY]: {
    navTitle: 'QAMPUS Privacy Policy',
    title: 'QAMPUS Privacy Policy',
    updated: UPDATED,
    sections: [
      {
        heading: 'Introduction',
        blocks: [
          'Welcome to QAMPUS. This Privacy Policy explains how we collect, use, share and otherwise process personal information in connection with the QAMPUS mobile application, the QAMPUS staff console and the public "Now Serving" display (collectively, the **"Services"**). We process personal information in line with the Data Privacy Act of 2012 (Republic Act No. 10173).',
        ],
      },
      {
        heading: '1. Information We Collect',
        blocks: [
          'We collect only what is needed to run a queue: Information You Provide, Information Created When You Use the Services, and Information From Google. More detail is provided below.',
          { subheading: 'Information You Provide' },
          { label: 'Student Profile', text: 'Your student ID and program, entered once on first sign-in. You may change your program later.' },
          { label: 'Guest Profile', text: 'Your name, guest type and, if you choose to give it, your email address. The App issues you a Guest ID.' },
          { subheading: 'Information Created When You Use the Services' },
          { label: 'Tickets', text: 'The offices you join, your ticket numbers, when you joined, were called, checked in and were served, and how each ticket ended (completed, cancelled or no-show).' },
          { label: 'Offenses and Bans', text: 'No-shows and cancellations after being called, any resulting ban, and whether staff revoked an offense and why.' },
          { label: 'Notifications', text: 'The in-app notifications we send you and whether you have read them.' },
          { label: 'Activity Log', text: 'A record of queue actions (joins, cancellations, check-ins and staff actions) with the time and the person who took them.' },
          { label: 'Settings', text: 'Your notification preference. Your theme choice stays on your device.' },
          { subheading: 'Information From Google' },
          { label: 'Account Information', text: 'When a student continues with Google, we receive the name and school email address on that Google account. Guests sign in anonymously; we receive only an identifier for the device’s session.' },
          'We do not collect your location, contacts, photos or files, and we do not run advertising or analytics trackers. When QR scanning is available, the camera is used only to read the office code and no images are kept.',
        ],
      },
      {
        heading: '2. How We Use Your Information',
        blocks: [
          'We use your information to: place you in a queue and show your position and estimated wait; tell you when your turn is coming and when it has come; let staff call you and verify you at the window; enforce the ticket limits, offenses and bans described in the Terms of Service; estimate whether an office can still serve new tickets before closing; and keep a record of actions for accountability and to resolve disputes.',
        ],
      },
      {
        heading: '3. Who Can See Your Information',
        blocks: [
          { label: 'Office Staff', text: 'Staff of an office you join can see your name, student ID or Guest ID, program, your tickets at that office and your offense record.' },
          { label: 'Public Display', text: 'The "Now Serving" screen at an office shows ticket numbers only. It never shows names or IDs.' },
          { label: 'Service Providers', text: 'Our data is stored and processed by Google Firebase (authentication and database) and sign-in is handled by Google. They process it on our behalf.' },
          'We do not sell your personal information or share it for marketing. We may disclose it when required by law or by a lawful order.',
        ],
      },
      {
        heading: '4. How Long We Keep It',
        blocks: [
          'In this version of QAMPUS, records are kept for as long as the Services run and are not deleted automatically. A guest who signs out loses access to their Guest ID and tickets, but the records themselves remain. You may ask us to delete your account and records as described below.',
        ],
      },
      {
        heading: '5. Security',
        blocks: [
          'Information travels over encrypted connections. Access rules ensure that you can read only your own tickets, notifications and record, and that staff can act only on their own office. No method of storage or transmission is completely secure, but we work to protect your information.',
        ],
      },
      {
        heading: '6. Your Rights',
        blocks: [
          'Under the Data Privacy Act you have the right to be informed, to access your information, to object, to have errors corrected, to have your information erased or blocked, to data portability and to file a complaint with the National Privacy Commission. You can see most of your information in the App under Profile, Queue History and Bans & Warnings. For any other request, contact us as described below.',
        ],
      },
      {
        heading: '7. Changes to This Policy',
        blocks: [
          'We may update this Privacy Policy. The date at the top shows the latest version. If a change is significant, we will tell you in the App.',
        ],
      },
      {
        heading: '8. Contact',
        blocks: [
          'Questions or requests about your personal information can be sent to the campus services team through Help & Support in the App, who will refer them to the school’s Data Protection Officer.',
        ],
      },
    ],
  },
});
