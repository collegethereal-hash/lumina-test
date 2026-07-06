'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem('lumina_auth');
    const authorized = !!auth;
    setIsAuthorized(authorized);

    console.log('AuthGuard Check:', { authorized, pathname, auth });

    if (!authorized && pathname !== '/') {
      console.log('AuthGuard: Not authorized, redirecting to /');
      router.push('/');
    }
  }, [pathname, router]);

  // If we're on the home page, we show children (which includes the AuthScreen itself)
  if (pathname === '/') {
    return <>{children}</>;
  }

  // While checking, show nothing to prevent flash of content
  if (isAuthorized === null) {
    return null;
  }

  // If authorized, show children. If not, the useEffect will redirect.
  return isAuthorized ? <>{children}</> : null;
}
