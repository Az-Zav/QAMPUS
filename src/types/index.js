// QAMPUS JSDoc Type Definitions
// Authoritative type shapes for domain entities, provider contracts, and action results.
// Matching Part 2 of the QAMPUS Client Guide.

/**
 * @typedef {'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'} TicketStatusType
 */

/**
 * @typedef {'waiting' | 'yourTurn' | 'expired' | 'inService' | 'completed' | 'cancelled' | 'cancelledByOffice' | 'noShow'} TicketUiStatusType
 */

/**
 * @typedef {'STUDENT' | 'GUEST' | 'STAFF' | 'SUPER_ADMIN'} UserRoleType
 */

/**
 * @typedef {'PARENT_GUARDIAN' | 'REPRESENTATIVE' | 'ALUMNI'} GuestTypeEnum
 */

/**
 * @typedef {'OPEN' | 'CLOSED'} QueueStatusType
 */

/**
 * @typedef {'NO_SHOW' | 'CANCELLED_AFTER_CALL'} OffenseTypeEnum
 */

/**
 * @typedef {'active' | 'revoked' | 'causedBan'} OffenseStateType
 */

/**
 * @typedef {'system' | 'light' | 'dark'} ThemeMode
 */

/**
 * @typedef {Object} DayHours
 * @property {string} open - Opening time 'HH:mm'
 * @property {string} close - Closing time 'HH:mm'
 */

/**
 * @typedef {Object.<'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN', DayHours | null>} WeekHoursMap
 */

/**
 * @typedef {Object} OfficeQueue
 * @property {QueueStatusType} status - Open or closed
 * @property {number} waitingCount - Number of waiting tickets
 * @property {number | null} nowServingSequence - Sequence number currently called/in-service
 * @property {number} estimatedWaitMinutes - Estimated wait time
 * @property {boolean} cutoffOverridden - True if staff bypassed the capacity cutoff
 */

/**
 * @typedef {Object} Office
 * @property {string} id - Unique office identifier
 * @property {string} code - Single letter code ('R', 'M', 'S')
 * @property {string} name - Office name
 * @property {string} location - Physical campus location
 * @property {WeekHoursMap} hours - Weekly operating schedule
 * @property {number} avgServiceMinutes - Average duration per transaction
 * @property {OfficeQueue} queue - Live queue state
 */

/**
 * @typedef {Object} Ticket
 * @property {string} id - Unique ticket ID (e.g. 'tkt_001')
 * @property {string} userId - Owner's user ID
 * @property {string} officeId - Reference to office
 * @property {string} officeCode - Office code (e.g. 'R')
 * @property {string} officeName - Display name of office
 * @property {string} ticketNumber - Full ticket code (e.g. 'R-09-28-015')
 * @property {number} dailySequence - Daily sequential number (e.g. 15)
 * @property {TicketStatusType} status - Current lifecycle status
 * @property {string} joinedAt - ISO timestamp when ticket was created
 * @property {string | null} calledAt - ISO timestamp when ticket was called
 * @property {string | null} serviceStartedAt - ISO timestamp when service began
 * @property {string | null} completedAt - ISO timestamp when service finished
 * @property {string | null} cancelledAt - ISO timestamp when ticket was cancelled
 * @property {string | null} noShowAt - ISO timestamp when ticket was marked no-show
 * @property {'USER' | 'OFFICE' | null} cancelledBy - Who cancelled the ticket
 * @property {number | null} counterNumber - Window or desk number
 * @property {number | null} positionInQueue - 1-based position in waiting line
 * @property {number | null} aheadCount - Number of people ahead
 * @property {number | null} estimatedWaitMinutes - Server-computed wait minutes
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique user ID
 * @property {UserRoleType} role - Student or Guest
 * @property {string} name - Display name
 * @property {string | null} email - Institutional or contact email
 * @property {string | null} institutionalId - 7-digit student ID or generated guest ID
 * @property {string | null} program - Academic program (students)
 * @property {GuestTypeEnum | null} guestType - Reason for visit (guests)
 */

/**
 * @typedef {Object} ActiveBan
 * @property {string} expiresAt - ISO timestamp when the ban expires
 * @property {string[]} offenseIds - Array of offense IDs triggering this ban
 */

/**
 * @typedef {Object} Bans
 * @property {number} offenseCount - Active offense count (0, 1, or 2)
 * @property {ActiveBan | null} ban - Active ban details or null
 */

/**
 * @typedef {Object} Offense
 * @property {string} id - Unique offense ID
 * @property {string} userId - Offending user ID
 * @property {string} ticketId - Associated ticket ID
 * @property {string} officeName - Name of the office
 * @property {string} ticketNumber - Ticket short/full number
 * @property {OffenseTypeEnum} type - Cause (NO_SHOW or CANCELLED_AFTER_CALL)
 * @property {boolean} causedBan - Whether this offense triggered a 24h ban
 * @property {string | null} revokedAt - ISO timestamp if administrative revocation occurred
 * @property {string} createdAt - ISO timestamp when recorded
 */

/**
 * @typedef {Object} Notification
 * @property {string} id - Unique notification ID
 * @property {string} userId - Recipient user ID
 * @property {string} type - Key of NOTIFICATION_TYPE
 * @property {string} title - Notification title
 * @property {string} message - Notification body text
 * @property {boolean} isRead - Read receipt status
 * @property {string} createdAt - ISO timestamp when dispatched
 */

/**
 * @typedef {Object} Settings
 * @property {ThemeMode} theme - Theme preference
 * @property {boolean} biometricsEnabled - Biometric auth toggle
 * @property {boolean} pushEnabled - Push notification toggle
 */

/**
 * @template T
 * @typedef {Object} ActionSuccess
 * @property {true} ok
 * @property {T} data
 */

/**
 * @typedef {Object} ActionFailure
 * @property {false} ok
 * @property {string} code - Key of ERROR_CODE
 * @property {string} message - User-facing error message
 */

/**
 * @template T
 * @typedef {ActionSuccess<T> | ActionFailure} ActionResult
 */

/**
 * @typedef {Object} JoinEligibility
 * @property {boolean} allowed
 * @property {string} [code] - Error code if not allowed
 * @property {string} [message] - User-facing explanatory message
 */

/**
 * @typedef {Object} OfficeHoursSummary
 * @property {boolean} isOpen - Currently within operating hours
 * @property {string} label - Human-readable status (e.g. 'Closes 5:00 PM', 'Opens tomorrow at 8:00 AM')
 * @property {number} minutesUntilClose - Minutes remaining until closing today
 * @property {string | null} nextOpen - Next opening day and time description
 */

/**
 * @typedef {Object} TicketStatusSummary
 * @property {TicketUiStatusType} status - Presentation status
 * @property {number | null} secondsLeft - Countdown seconds if CALLED and not expired
 */

/**
 * @typedef {Object} DeviceCapabilities
 * @property {boolean} biometricsAvailable - Device supports biometric auth
 * @property {boolean} biometricsEnrolled - Biometric credentials enrolled
 * @property {boolean} pushPermissionGranted - Push notification permission active
 */

/**
 * @template T
 * @typedef {Object} ProviderState
 * @property {'loading' | 'ready' | 'error'} status - Lifecycle status
 * @property {T} data - Shared state payload
 * @property {Object.<string, (...args: any[]) => Promise<ActionResult<any>>>} actions - Provider actions
 */

export {};
