import { Redirect } from 'expo-router';

// Entry route. The auth gate (onboarding / login / profile completion) replaces this in the navigation phase.
export default function Index() {
  return <Redirect href="/playground" />;
}
