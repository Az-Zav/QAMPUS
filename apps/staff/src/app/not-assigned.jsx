import { ButtonType, NOT_ASSIGNED_COPY, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { useSession, useThemedStyles } from '@/hooks';
import { Button } from '@qampus/ui';
import { StyleSheet, Text, View } from 'react-native';

// W02 — Signed in, but no office assignment yet
export default function NotAssigned() {
  const styles = useThemedStyles(makeStyles);
  const { user, signOut } = useSession();

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>{NOT_ASSIGNED_COPY.title}</Text>
        <Text style={styles.body}>{NOT_ASSIGNED_COPY.body}</Text>
        {!!user?.email && <Text style={styles.account}>{user.email}</Text>}
        <Button label={NOT_ASSIGNED_COPY.signOut} type={ButtonType.SECONDARY} onPress={signOut} style={styles.button} />
      </View>
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    screen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.paper, padding: SPACING.xxl },
    content: { width: '100%', maxWidth: 760, alignItems: 'center', gap: SPACING.md },
    title: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.size.xxl, color: c.ink },
    body: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.md,
      lineHeight: 22,
      color: c.slate,
      textAlign: 'center',
    },
    account: { fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: TYPOGRAPHY.size.base, color: c.ink },
    button: { borderRadius: RADII.full, marginTop: SPACING.lg, minWidth: 160 },
  });
