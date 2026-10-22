import ActionButton from '@/components/primitives/ActionButton';
import CenteredMessage from '@/components/shell/CenteredMessage';
import { ButtonType, NOT_ASSIGNED_COPY } from '@/constants';
import { useSession } from '@/hooks';
import { ShieldCheck } from '@/icons';
import { StyleSheet } from 'react-native';

// W02 — Signed in, but no office assignment yet. Sign-out only.
export default function NotAssigned() {
  const { signOut } = useSession();

  return (
    <CenteredMessage Icon={ShieldCheck} title={NOT_ASSIGNED_COPY.title} body={NOT_ASSIGNED_COPY.body}>
      <ActionButton
        label={NOT_ASSIGNED_COPY.signOut}
        type={ButtonType.SECONDARY}
        onPress={signOut}
        style={styles.button}
      />
    </CenteredMessage>
  );
}

const styles = StyleSheet.create({
  button: { width: 285 },
});
