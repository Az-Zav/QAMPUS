import { useSession } from '@/hooks';
import { Redirect } from 'expo-router';

// Entry route: onboarding until completed, then Login.
// The full auth gate (signed in -> Home, profile completion) comes in the navigation phase.
export default function Index() {
  const { hasOnboarded } = useSession();
  return <Redirect href={hasOnboarded ? '/login' : '/onboarding'} />;
}
