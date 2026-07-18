import { AppRoutes } from '@/routes';
import { useDirtyGuard, useThemeEffect } from '@/hooks/useDirtyGuard';

export default function App() {
  useDirtyGuard();
  useThemeEffect();
  return <AppRoutes />;
}
