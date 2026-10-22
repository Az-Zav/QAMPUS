import { useSession } from '@/hooks';
import { Redirect } from 'expo-router';

import { USER_ROLE } from '@/constants';

// Entry route: wait for Firebase to restore the session, then route by auth state.
export default function Index() {
  const { authReady, isSignedIn, needsProfile, user, hasOnboarded } = useSession();

  // Splash screen is already hidden by now; render nothing for the brief restore
  if (!authReady) return null;

  if (isSignedIn) {
    if (needsProfile) {
      return <Redirect href={user.role === USER_ROLE.GUEST ? '/guest-profile' : '/complete-profile'} />;
    }
    return <Redirect href="/home" />;
  }

  return <Redirect href={hasOnboarded ? '/login' : '/onboarding'} />;
}
