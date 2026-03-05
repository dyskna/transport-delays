import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthHeader from "../components/AuthHeader";
import Alert from "../components/Alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL;

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch(`${API}/api/Auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error(await res.text());

      setAlert({
        message: "Sprawdź skrzynkę e-mail – wysłaliśmy link do resetu hasła.",
        type: "success",
      });

      // ⏳ po 1,2 sekundy wraca automatycznie na logowanie
      setTimeout(() => {
        navigate("/logowanie");
      }, 1500);

      setEmail("");
    } catch (err) {
      setAlert({
        message: "Nie udało się wysłać linku. Spróbuj ponownie.",
        type: "error",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* === ALERT GŁÓWNY === */}
      {alert.message && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ message: "", type: "" })}
        />
      )}

      {/* === NAGŁÓWEK === */}
      <AuthHeader />

      {/* === FORMULARZ === */}
      <div className="auth-container">
        <h2 className="auth-heading">NIE PAMIĘTAM HASŁA</h2>

        <form className="auth-form-f" onSubmit={handleSubmit}>
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

          <button type="submit" className="auth-button" disabled={sending}>
            {sending ? "Wysyłanie…" : "ZRESETUJ HASŁO"}
          </button>

          <Link to="/logowanie" className="auth-link">
            WRÓĆ DO LOGOWANIA
          </Link>
        </form>
      </div>
    </>
  );
}
