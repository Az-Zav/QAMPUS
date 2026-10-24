# Firestore schema (V1 draft)

Final shape for V1, locked one collection at a time. Locking a collection fixes its fields; seeding and implementation still happen per slice, not all at once.

| Collection | Status |
|---|---|
| `users` | **LOCKED** |
| everything else | draft |

Open items at the bottom.
Document IDs are in the comments. Everything is a Firestore document; `timestamp` fields must equal server time on write.

```mermaid
erDiagram
  USERS {
    string uid PK "doc id = Firebase Auth uid"
    string role "STUDENT or GUEST"
    string name
    string email
    string institutional_id "student ID or guest ID"
    string program
    string guest_type "guests only"
    boolean push_enabled
    string push_token
    int strike_count
    timestamp banned_until
    int active_count "open tickets, max 3"
    timestamp created_at
    timestamp updated_at
  }

  INSTITUTIONAL_IDS {
    string id PK "doc id = the student or guest ID"
    string uid FK "create-only claim keeps IDs unique"
  }

  OFFICES {
    string id PK
    string code "R, C, A... used in ticket numbers"
    string name
    string short_name
    string location
    string status "ACTIVE or INACTIVE"
    int default_service_minutes
    map hours "MON..SUN each open_min and close_min"
    string check_in_code "6 digits, same value in the QR and for manual entry"
  }

  STAFF {
    string email PK "doc id = lowercase email"
    string office_id FK
    string role "STAFF or SUPER_ADMIN"
    string name
  }

  QUEUES {
    string id PK "doc id = officeId_yyyymmdd"
    string status "OPEN or CLOSED"
    int last_seq "last ticket number issued today"
    int last_called_seq "last ticket number called"
    string current_ticket_id FK "null when the window is free"
    boolean cutoff_overridden
    int completed_count "for the service-time average"
    int service_seconds_total "for the service-time average"
    timestamp created_at
    timestamp updated_at
  }

  TICKETS {
    string id PK "doc id = queueId_seq"
    string office_id FK
    string office_name "snapshot for history"
    int queue_date "yyyymmdd"
    string user_id FK
    string holder_name "snapshot so staff need no user read"
    string holder_institutional_id "snapshot"
    int daily_sequence
    string ticket_number "CODE-MM-DD-SEQ"
    string status "WAITING CALLED IN_SERVICE COMPLETED CANCELLED NO_SHOW"
    string cancelled_by "USER or OFFICE or SYSTEM"
    string reason "no-show reason"
    timestamp joined_at "WAITING"
    timestamp called_at "CALLED"
    timestamp service_started_at "IN_SERVICE"
    timestamp completed_at "COMPLETED"
    timestamp cancelled_at "CANCELLED"
    timestamp no_show_at "NO_SHOW"
  }

  OFFENSES {
    string id PK
    string user_id FK
    string ticket_id FK
    string office_id FK
    string office_name
    string ticket_number
    string type "NO_SHOW or CANCELLED_AFTER_CALL"
    boolean resulted_in_ban
    string revoked_by FK
    timestamp revoked_at "null means active"
    timestamp created_at
  }

  EVENTS {
    string id PK
    string entity_type "TICKET QUEUE OFFICE USER OFFENSE"
    string entity_id "polymorphic, no FK"
    string action
    string from_status
    string to_status
    string actor_uid FK
    string actor_name
    string reason
    string office_id FK
    string ticket_number
    timestamp created_at
  }

  NOTIFICATIONS {
    string id PK "users/uid/notifications/id"
    string type
    string title
    string message
    string ticket_id FK
    string office_id FK
    boolean is_read
    timestamp created_at
    timestamp read_at
  }

  ANNOUNCEMENTS {
    string id PK
    string title
    string message
    timestamp created_at
    timestamp expires_at
  }

  USERS ||--o| INSTITUTIONAL_IDS : claims
  USERS ||--o{ TICKETS : holds
  USERS ||--o{ OFFENSES : receives
  USERS ||--o{ NOTIFICATIONS : "mailbox"
  OFFICES ||--o{ STAFF : "assigned"
  OFFICES ||--o{ QUEUES : "one per day"
  QUEUES ||--o{ TICKETS : "issues"
  QUEUES |o--o| TICKETS : "current_ticket_id"
  TICKETS ||--o{ OFFENSES : "causes"
  TICKETS ||--o{ EVENTS : "logged via entity_id"
  STAFF ||--o{ EVENTS : "acts (by email lookup)"
```

## Reading notes
- **Ticket state ↔ timestamp** is one to one: `WAITING→joined_at`, `CALLED→called_at`, `IN_SERVICE→service_started_at`, `COMPLETED→completed_at`, `CANCELLED→cancelled_at`, `NO_SHOW→no_show_at`. "Expired" is derived (`called_at + 60 s`), not stored.
- **Queue position** is derived on the client: `daily_sequence - last_called_seq`. Waiting ≈ `last_seq - last_called_seq`.
- **Not stored:** position, people ahead, estimated wait, short ticket number (`CODE-SEQ`).
- **Office timezone** is one campus constant (UTC+8) in the rules and the app, not a field.

## Which slice implements what
| Slice | Collections used |
|---|---|
| 1 Ticketing | `users` (profile), `offices`, `staff`, `queues`, `tickets` |
| 2 Penalties | `offenses`, strike and ban fields on `users`, `events` |
| 3 Limits and capacity | `active_count`, queue service totals, office hours checks |
| 4 Notifications | `notifications`, `announcements`, push token fields |
| 5 Guests | `institutionalIds` claims for guests, anonymous `users` |

## Open items
1. Keep the office `short_name`? (UI uses it a lot.)
2. Push needs a place for the holder's token on the ticket; depends on the push option (relay or in-app only).
3. `announcements` as a shared collection merged into the notification list (no server can fan out writes).
