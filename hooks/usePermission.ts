import { useContext, useMemo } from 'react';
import { AuthContext } from '@/components/AuthProvider';

export const usePermission = (requiredRoles: string[]) => {
  const { user } = useContext(AuthContext);

  return useMemo(() => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }, [user, requiredRoles]);
};