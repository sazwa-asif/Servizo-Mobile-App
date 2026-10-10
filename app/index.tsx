import { Redirect } from 'expo-router';
import { useApp } from '../src/store/AppContext';

export default function Index() {
  const { user } = useApp();
  if (!user) return <Redirect href="/welcome" />;
  return <Redirect href={user.role === 'provider' ? '/dashboard' : '/home'} />;
}
