import { AppRoutes } from '@/routes';
import { useDirtyGuard, useLightThemeOnly } from '@/hooks/useDirtyGuard';

export default function App() {
  useDirtyGuard();
  useLightThemeOnly();
  return <AppRoutes />;
}
