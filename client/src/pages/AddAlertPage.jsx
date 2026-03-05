import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";
import Alert from "../components/Alert";
import trainIcon from "../assets/transport.png";

export default function AddAlertPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;

  const [form, setForm] = useState({
    rideId: 0,
    transportType: 0,
    incidentType: 0,
    lineNumber: "",
    title: "",
    description: "",
    delayMinutes: "",
  });

  const [alert, setAlert] = useState({ message: "", type: "" });
  const [saving, setSaving] = useState(false);
  const [rides, setRides] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/ride`)
      .then((res) => res.json())
      .then((data) => setRides(data))
      .catch((err) => console.error("Błąd przy pobieraniu tras:", err));
  }, [API]);

  if (!user?.token) {
    navigate("/logowanie");
    return null;
  }

  // 🔹 Funkcja określająca stronę powrotu na podstawie roli
  const getReturnPath = () => {
    switch (user?.role) {
      case "Admin":
        return "/profil-admina";
      case "Moderator":
        return "/profil-moderatora";
      default:
        return "/profil"; // Passenger
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert({ message: "", type: "" });

    try {
      const res = await fetch(`${API}/api/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          ...form,
          delayMinutes: Number(form.delayMinutes),
          rideId: Number(form.rideId),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      setAlert({ message: "✅ Alert został dodany!", type: "success" });

      // 🔹 Przekierowanie po udanym dodaniu w zależności od roli
      setTimeout(() => navigate(getReturnPath()), 1500);
    } catch (err) {
      setAlert({
        message: "❌ Nie udało się dodać alertu. " + (err.message || ""),
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AuthHeader />
      {alert.message && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ message: "", type: "" })}
        />
      )}

      <div className="alert-page">
        <div className="alert-card">
          <div className="alert-header">
            <img src={trainIcon} alt="Alert" className="alert-icon" />
            <h2> DODAJ ALERT</h2>
          </div>

          <form className="alert-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Typ transportu:</label>
              <select
                name="transportType"
                value={form.transportType}
                onChange={handleChange}
                required
              >
                <option value={0}>Pociąg</option>
                <option value={1}>Autobus</option>
                <option value={2}>Tramwaj</option>
                <option value={3}>Metro</option>
              </select>
            </div>

            <div className="form-row">
              <label>Typ incydentu:</label>
              <select
                name="incidentType"
                value={form.incidentType}
                onChange={handleChange}
                required
              >
                <option value={0}>Opóźnienie</option>
                <option value={1}>Awaria</option>
                <option value={2}>Odwołanie kursu</option>
                <option value={3}>Inne</option>
              </select>
            </div>

            <div className="form-row">
              <label>Numer linii</label>
              <input
                name="lineNumber"
                value={form.lineNumber}
                onChange={handleChange}
                placeholder="Np. IC135"
                required
              />
            </div>

            <div className="form-row">
              <label>Tytuł</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Krótki tytuł"
                required
              />
            </div>

            <div className="form-row">
              <label>Opis</label>
              <textarea
                name="description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value.slice(0, 200),
                  }))
                }
                placeholder="Szczegóły zdarzenia..."
                rows="3"
                required
              />
              <p style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                {form.description.length}/200 znaków
              </p>
            </div>

            <div className="form-row">
              <label>Trasa</label>
              <select
                name="rideId"
                value={form.rideId}
                onChange={handleChange}
                required
              >
                <option value="">Wybierz trasę...</option>
                {rides.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.lineNumber} — {r.startStation} → {r.endStation}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label>Opóźnienie (w minutach)</label>
              <input
                type="number"
                name="delayMinutes"
                value={form.delayMinutes}
                onChange={handleChange}
                placeholder="np. 25"
                min="0"
                required
              />
            </div>

            <button type="submit" className="alert-btn" disabled={saving}>
              {saving ? "Zapisywanie…" : "🚨 DODAJ ALERT"}
            </button>

            <button
              type="button"
              className="alert-cancel"
              onClick={() => navigate(getReturnPath())}
            >
              Anuluj
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
