import Header from '@/components/shell/Header';
import TicketStubCard from '@/components/tickets/TicketStubCard';
import theme from '@/theme/theme';
import { ScrollView, StyleSheet } from 'react-native';

export default function Home() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header title="HOME" hasNotification onBellPress={() => {}} onAvatarPress={() => {}} />

      <TicketStubCard
        ticket={{
          shortNumber: 'R-006',
          nowServing: 'R-002',
          officeName: 'University Registrar',
          location: 'Main Bldg, 3rd Flr',
          status: 'waiting',
          estimatedWaitMinutes: 8,
        }}
        nextUp
        onPress={() => console.log('open ticket modal')}
      />

      <TicketStubCard
        ticket={{
          shortNumber: 'R-006',
          nowServing: 'R-002',
          officeName: 'University Registrar',
          location: 'Main Bldg, 3rd Flr',
          status: 'yourTurn',
        }}
        onOpenScanner={() => console.log('open scanner')}
      />

      <TicketStubCard
        ticket={{
          shortNumber: 'R-006',
          nowServing: 'R-002',
          officeName: 'University Registrar',
          location: 'Main Bldg, 3rd Flr',
          status: 'expired',
        }}
      />

      <TicketStubCard
        ticket={{
          shortNumber: 'R-006',
          nowServing: 'R-002',
          officeName: 'University Registrar',
          location: 'Main Bldg, 3rd Flr',
          status: 'inService',
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.paper,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 120, // extra space so last card isn't hidden under BottomNav
  },
});