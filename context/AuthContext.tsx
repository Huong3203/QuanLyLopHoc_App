import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';

interface AuthContextType {
  user: any;
  role: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const getProfileAndRole = async (userId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      setRole(profile?.role ?? null);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user;
      setUser(currentUser);
      if (currentUser) {
        getProfileAndRole(currentUser.id);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;
      setUser(currentUser);
      if (currentUser) {
        getProfileAndRole(currentUser.id);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
