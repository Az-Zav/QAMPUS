export default function TicketStubCard({ ticket, nextUp, onPress, onOpenScanner }) {
  // ticket.status: 'waiting' | 'yourTurn' | 'expired' | 'inService' | 'completed' | 'cancelled' | 'noShow'
  // onPress: omit/disable when inService
  // onOpenScanner: relevant only when yourTurn (CALLED)
  return null; // stub
}