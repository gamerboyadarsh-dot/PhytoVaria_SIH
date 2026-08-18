import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

/**
 * Minimal auth state for the hackathon MVP. Real credential checking
 * belongs to Member 2's backend (POST /api/auth/login) — swap the body
 * of login() for a real api.login() call once that endpoint exists.
 * Until then this accepts any non-empty username/password so the rest
 * of the team can build against a logged-in state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const cached = sessionStorage.getItem("phytovaria_user");
    return cached ? JSON.parse(cached) : null;
  });

  const login = async (username, _password) => {
    const nextUser = { name: username, role: "Field Researcher" };
    sessionStorage.setItem("phytovaria_user", JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  };

  const logout = () => {
    sessionStorage.removeItem("phytovaria_user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
