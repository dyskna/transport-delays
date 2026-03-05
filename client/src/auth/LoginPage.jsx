import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthHeader from "../components/AuthHeader";
import Alert from "../components/Alert";
import eyeOpen from "../assets/eyeopen.png";
import eyeClosed from "../assets/eyeclosed.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });

  const navigate = useNavigate();
  const location = useLocation();
  const infoMessage = location.state?.info;

  const { login } = useAuth();
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (infoMessage) {
      setAlert({ message: infoMessage, type: "success" });
      // czyścimy state.location, by nie powtarzał się po refreshu
      window.history.replaceState({}, document.title);
    }
  }, [infoMessage]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAlert({ message: "", type: "" });

    try {
      const response = await fetch(`${API}/api/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const txt = await response.text();
        setAlert({
          message: "Logowanie nie powiodło się: " + (txt || "Nieznany błąd."),
          type: "error",
        });
        return;
      }

      const data = await response.json();
      await login({ token: data.token });

      setAlert({
        message: "Zalogowano pomyślnie. Przekierowywanie...",
        type: "success",
      });

      setTimeout(() => navigate("/"), 1200);
    } catch {
      setAlert({
        message: "Błąd połączenia z serwerem.",
        type: "error",
      });
    }
  };

  return (
    <>
      {/* === ALERT === */}
      {alert.message && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ message: "", type: "" })}
        />
      )}

      {/* === HEADER === */}
      <AuthHeader />

      {/* === FORMULARZ === */}
      <div className="auth-container">
        <div className="auth-tabs">
          <Link to="/logowanie" className="tab active">
            ZALOGUJ SIĘ
          </Link>
          <Link to="/rejestracja" className="tab">
            ZAREJESTRUJ SIĘ
          </Link>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <label>
            Adres e-mail
            <input
              name="email"
              type="text"
              placeholder="Adres e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="password-input">
            Hasło
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <img
              src={showPassword ? eyeClosed : eyeOpen}
              alt={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
              title={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer", width: 20, height: 20 }}
            />
          </label>

          <button type="submit" className="auth-button">
            ZALOGUJ SIĘ
          </button>

          <Link to="/przypomnij-haslo" className="auth-link">
            NIE PAMIĘTAM HASŁA
          </Link>
        </form>
      </div>
    </>
  );
}
