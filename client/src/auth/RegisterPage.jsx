import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";
import Alert from "../components/Alert";
import eyeOpen from "../assets/eyeopen.png";
import eyeClosed from "../assets/eyeclosed.png";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password1 !== password2) {
      setAlert({ message: "Hasła muszą być takie same.", type: "error" });
      return;
    }

    try {
      const response = await fetch(`${API}/api/Auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password1 }),
      });

      if (response.ok) {
        setAlert({
          message:
            "Konto utworzone! Sprawdź skrzynkę e-mail, aby potwierdzić rejestrację.",
          type: "success",
        });
        setTimeout(() => {
          navigate("/logowanie", {
            state: { info: "Konto zostało utworzone. Sprawdź swój e-mail." },
          });
        }, 1500);
      } else {
        const err = await response.text();
        setAlert({
          message: "Rejestracja nie powiodła się: " + err,
          type: "error",
        });
      }
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
          <Link to="/logowanie" className="tab">
            ZALOGUJ SIĘ
          </Link>
          <Link to="/rejestracja" className="tab active">
            ZAREJESTRUJ SIĘ
          </Link>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <label>
            Adres e-mail
            <input
              type="email"
              placeholder="Adres e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="password-input">
            Hasło
            <input
              type={showPass1 ? "text" : "password"}
              placeholder="Hasło"
              value={password1}
              onChange={(e) => setPassword1(e.target.value)}
              required
            />
            <img
              src={showPass1 ? eyeClosed : eyeOpen}
              alt={showPass1 ? "Ukryj hasło" : "Pokaż hasło"}
              title={showPass1 ? "Ukryj hasło" : "Pokaż hasło"}
              onClick={() => setShowPass1(!showPass1)}
              style={{ cursor: "pointer", width: 20, height: 20 }}
            />
          </label>

          <label className="password-input">
            Powtórz hasło
            <input
              type={showPass2 ? "text" : "password"}
              placeholder="Powtórz hasło"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
            <img
              src={showPass2 ? eyeClosed : eyeOpen}
              alt={showPass2 ? "Ukryj hasło" : "Pokaż hasło"}
              title={showPass2 ? "Ukryj hasło" : "Pokaż hasło"}
              onClick={() => setShowPass2(!showPass2)}
              style={{ cursor: "pointer", width: 20, height: 20 }}
            />
          </label>

          <button type="submit" className="auth-button">
            ZAREJESTRUJ SIĘ
          </button>
        </form>
      </div>
    </>
  );
}
