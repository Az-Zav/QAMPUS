import Header from '@/components/shell/Header';
import InfoCard from '@/components/shell/InfoCard';
import { COLORS, InfoCardType, SPACING, TYPOGRAPHY } from '@/constants';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const FAQS = [
  {
    id: '1',
    title: 'How many active tickets can I hold at once?',
    body: 'You can hold up to 3 active tickets across different campus offices at the same time.',
  },
  {
    id: '2',
    title: 'What happens if I miss my turn?',
    body: 'If you do not check in within 60 seconds of being called, your ticket expires and an offense is recorded. Two offenses within 24 hours will pause your ability to join queues.',
  },
  {
    id: '3',
    title: 'Can I leave a queue before being called?',
    body: 'Yes! Leaving a queue before you are called is always free and will never count as an offense.',
  },
  {
    id: '4',
    title: 'How do I check in when my turn comes?',
    body: 'When your ticket status changes to "Your Turn", open the scanner tab or tap "Open Scanner" on the alert dialog, and scan the QR code located at the office window.',
  },
];

export default function HelpScreen() {
  const [expandedId, setExpandedId] = useState(null);

  const toggleFaq = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.screen}>
      <Header title="HELP & POLICY" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          {FAQS.map((faq) => (
            <InfoCard
              key={faq.id}
              type={InfoCardType.FAQ}
              title={faq.title}
              body={faq.body}
              expanded={expandedId === faq.id}
              onPress={() => toggleFaq(faq.id)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Offense Policy</Text>
        <InfoCard type={InfoCardType.POLICY} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl * 2,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.ink,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  faqList: {
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
});
