import { createContext, useContext, useEffect, useState } from "react";

const API = process.env.REACT_APP_API_URL;
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// rola z JWT – awaryjnie
function parseRoleFromJwt(token) {
  try {
    const base64 = token?.split(".")[1];
    if (!base64) return null;
    const payload = JSON.parse(atob(base64));
    return (
      payload.role ||
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload.roles ||
      null
    );
  } catch {
    return null;
  }
}

function resolveRole({ role, isModerator, isAdmin, token } = {}) {
  if (role) return role;
  if (isModerator) return "Moderator";
  if (isAdmin) return "Admin";
  const jwtRole = token ? parseRoleFromJwt(token) : null;
  if (jwtRole) {
    return Array.isArray(jwtRole) ? jwtRole[0] || "User" : jwtRole;
  }
  return "User";
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async (token) => {
    try {
      const res = await fetch(`${API}/api/User/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Nie udało się pobrać danych użytkownika.");
      const data = await res.json();
      const normalized = {
        ...data,
        token,
        role: resolveRole({ ...data, token }),
      };
      setUser(normalized);
      sessionStorage.setItem("auth", JSON.stringify(normalized));
    } catch (e) {
      console.error(e);
      logout();
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("auth");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch {
        sessionStorage.removeItem("auth");
      }
    }
    setLoading(false);
  }, []);

  const login = async ({ token }) => {
    await refreshUser(token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
