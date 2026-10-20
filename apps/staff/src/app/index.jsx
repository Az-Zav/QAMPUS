import { useSession } from '@/hooks';
import { Redirect } from 'expo-router';

// Anchor route: sends each session state to its home.
export default function Index() {
  const { isSignedIn, hasOffice } = useSession();
  if (!isSignedIn) return <Redirect href="/sign-in" />;
  return <Redirect href={hasOffice ? '/queue' : '/not-assigned'} />;
}
