import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import eyeOpen from "../assets/eyeopen.png";
import eyeClosed from "../assets/eyeclosed.png";
import AuthHeader from "../components/AuthHeader";
import Alert from "../components/Alert";

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL;

  async function handleSubmit(e) {
    e.preventDefault();
    setAlert({ message: "", type: "" });

    if (!user?.token) {
      setAlert({ message: "Musisz być zalogowana/y.", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setAlert({
        message: "Nowe hasło musi mieć min. 6 znaków.",
        type: "error",
      });
      return;
    }
    if (newPassword !== confirm) {
      setAlert({ message: "Hasła nie są identyczne.", type: "error" });
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API}/api/Auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) throw new Error(await res.text());

      setAlert({ message: "Hasło zostało zmienione.", type: "success" });

      setTimeout(() => {
        navigate("/profil", { state: { info: "Hasło zmienione pomyślnie." } });
      }, 1500);
    } catch (e) {
      setAlert({
        message: "Nie udało się zmienić hasła. " + (e?.message || ""),
        type: "error",
      });
    } finally {
      setSaving(false);
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
        <h2 className="auth-heading">ZMIEŃ HASŁO</h2>

        <form className="auth-form-c" onSubmit={handleSubmit}>
          <label className="password-input">
            Aktualne hasło
            <input
              type={showOld ? "text" : "password"}
              placeholder="Aktualne hasło"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <img
              src={showOld ? eyeClosed : eyeOpen}
              alt={showOld ? "Ukryj hasło" : "Pokaż hasło"}
              title={showOld ? "Ukryj hasło" : "Pokaż hasło"}
              onClick={() => setShowOld(!showOld)}
              style={{ cursor: "pointer", width: 20, height: 20 }}
            />
          </label>

          <label className="password-input">
            Nowe hasło
            <input
              type={showNew ? "text" : "password"}
              placeholder="Nowe hasło"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <img
              src={showNew ? eyeClosed : eyeOpen}
              alt={showNew ? "Ukryj hasło" : "Pokaż hasło"}
              title={showNew ? "Ukryj hasło" : "Pokaż hasło"}
              onClick={() => setShowNew(!showNew)}
              style={{ cursor: "pointer", width: 20, height: 20 }}
            />
          </label>

          <label>
            Potwierdź nowe hasło
            <input
              type={showNew ? "text" : "password"}
              placeholder="Powtórz nowe hasło"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="auth-button" disabled={saving}>
            {saving ? "Zapisywanie…" : "ZMIEŃ HASŁO"}
          </button>

          <Link to="/profil" className="auth-link">
            Anuluj i wróć do profilu
          </Link>
        </form>
      </div>
    </>
  );
}
