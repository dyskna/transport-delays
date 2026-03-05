import "../styles/main.css";
import logo from "../assets/logo2.png";
import iconUser from "../assets/user.png";
import iconLocation from "../assets/location.png";
import iconSwap from "../assets/swap.png";
import iconCalendar from "../assets/calendar.png";
import iconClock from "../assets/clock.png";
import DatePicker from "react-datepicker";
import MapPage from "./MapPage";
import "react-datepicker/dist/react-datepicker.css";
import { pl } from "date-fns/locale";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [openDate, setOpenDate] = useState(false);
  const [openTime, setOpenTime] = useState(false);
  const [rides, setRides] = useState([]);
  const [loadingRides, setLoadingRides] = useState(false);

  const calendarRef = useRef(null);
  const timeRef = useRef(null);

  const API = process.env.REACT_APP_API_URL;

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const stations = [
    "Kraków Główny",
    "Warszawa Centralna",
    "Katowice",
    "Wrocław Główny",
    "Poznań Główny",
    "Szczecin Główny",
    "Czerwone Maki",
    "Plac Centralny",
    "Bronowice Małe",
    "Borek Fałęcki",
  ];

  // zamykanie pop-upów po kliknięciu poza
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (calendarRef.current && calendarRef.current.contains(e.target)) ||
        (timeRef.current && timeRef.current.contains(e.target))
      ) {
        return;
      }
      setOpenDate(false);
      setOpenTime(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // jeśli auth się jeszcze ładuje – zapobiega błędnemu przekierowaniu
  if (loading) {
    return <p style={{ textAlign: "center", marginTop: 40 }}>Ładowanie...</p>;
  }

  async function handleSearch() {
    if (!from || !to) {
      alert("Podaj stację początkową i końcową!");
      return;
    }

    setLoadingRides(true);
    setRides([]);

    try {
      const res = await fetch(
        `${API}/api/Ride/search?from=${encodeURIComponent(
          from,
        )}&to=${encodeURIComponent(to)}&time=${encodeURIComponent(time)}`,
      );

      if (!res.ok) throw new Error("Błąd wyszukiwania");

      const data = await res.json();
      setRides(data);
    } catch (err) {
      console.error("Błąd pobierania przejazdów:", err);
    } finally {
      setLoadingRides(false);
    }
  }

  return (
    <div className="home-container">
      {/* === HEADER === */}
      <header className="home-header">
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <img src={logo} alt="Railert logo" className="logo" />
            <div className="logo-text"></div>
          </Link>
        </div>

        <div className="user-box">
          <img
            src={iconUser}
            alt="User"
            className="clickable-icon"
            onClick={() => {
              if (!user) navigate("/logowanie");
              else if (user.role === "Admin") navigate("/profil-admina");
              else if (user.role === "Moderator")
                navigate("/profil-moderatora");
              else navigate("/profil");
            }}
          />
        </div>
      </header>

      {/* === MAIN === */}
      <main>
        {/* === PANEL WYSZUKIWANIA === */}
        <section className="search-section">
          <div className="search-box">
            <div className="inputs-row">
              {/* SKĄD */}
              <div className="input-group">
                <img src={iconLocation} alt="From" className="icon" />
                <input
                  list="station-list"
                  type="text"
                  placeholder="Skąd jedziemy?"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>

              {/* ZAMIANA */}
              <div className="input-group swap">
                <img
                  src={iconSwap}
                  alt="Swap"
                  className="icon-swap"
                  onClick={handleSwap}
                />
              </div>

              {/* DOKĄD */}
              <div className="input-group">
                <input
                  list="station-list"
                  type="text"
                  placeholder="Dokąd jedziemy?"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>

              {/* LISTA PODPOWIEDZI */}
              <datalist id="station-list">
                {stations.map((s, i) => (
                  <option key={i} value={s} />
                ))}
              </datalist>

              {/* DATA */}
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Kiedy?"
                  value={date ? date.toLocaleDateString("pl-PL") : ""}
                  readOnly
                />
                <img
                  src={iconCalendar}
                  alt="Calendar"
                  className="icon clickable"
                  onClick={() => {
                    setOpenDate(!openDate);
                    setOpenTime(false);
                  }}
                />
                {openDate && (
                  <div className="calendar-popup" ref={calendarRef}>
                    <DatePicker
                      selected={date}
                      onChange={(d) => {
                        setDate(d);
                        setOpenDate(false);
                      }}
                      inline
                      locale={pl}
                    />
                  </div>
                )}
              </div>

              {/* GODZINA */}
              <div className="input-group">
                <input
                  type="text"
                  placeholder="O której?"
                  value={time}
                  readOnly
                />
                <img
                  src={iconClock}
                  alt="Clock"
                  className="icon clickable"
                  onClick={() => {
                    setOpenTime(!openTime);
                    setOpenDate(false);
                  }}
                />
                {openTime && (
                  <div className="calendar-popup" ref={timeRef}>
                    <DatePicker
                      selected={
                        time ? new Date(`1970-01-01T${time}`) : new Date()
                      }
                      onChange={(d) => {
                        const formatted = d
                          .toLocaleTimeString("pl-PL", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                          .replace(":", ":");
                        setTime(formatted);
                        setOpenTime(false);
                      }}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={15}
                      timeCaption="Godzina"
                      dateFormat="HH:mm"
                      inline
                      locale={pl}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* RZĄD 2 */}
            <div className="inputs-row">
              <div className="input-group-q">
                <label>Ilość Przesiadek:</label>
                <select>
                  <option>0</option>
                  <option>1</option>
                  <option>2+</option>
                </select>
              </div>

              <div className="input-group-q">
                <label>Ilość Pasażerów:</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={passengers}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // tylko cyfry
                    setPassengers(value === "" ? "" : value);
                  }}
                />
              </div>
            </div>

            <div className="search-btn-container">
              <button className="search-btn" onClick={handleSearch}>
                Szukaj
              </button>
            </div>

            {/* === WYNIKI WYSZUKIWANIA === */}
            {loadingRides && (
              <p style={{ textAlign: "center" }}>Ładowanie wyników...</p>
            )}

            {!loadingRides && rides.length > 0 && (
              <div className="results-container">
                <h3 style={{ textAlign: "center", marginTop: 20 }}>
                  Znalezione przejazdy
                </h3>

                <table className="search-table">
                  <thead>
                    <tr>
                      <th>Linia</th>
                      <th>Trasa</th>
                      <th>Odjazd</th>
                      <th>Przyjazd</th>
                      <th>Opóźnienie</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rides.map((r) => (
                      <tr key={r.id}>
                        <td>{r.lineNumber}</td>
                        <td>
                          {r.startStation} → {r.endStation}
                        </td>
                        <td>
                          {new Date(r.scheduledDeparture).toLocaleTimeString(
                            "pl-PL",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </td>
                        <td>
                          {new Date(r.scheduledArrival).toLocaleTimeString(
                            "pl-PL",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </td>
                        <td>
                          {r.delayMinutes > 0 ? `+${r.delayMinutes} min` : "—"}
                        </td>
                        <td>
                          <span
                            className={`status-dot ${
                              r.isCancelled
                                ? "cancelled"
                                : r.delayMinutes >= 30
                                  ? "red"
                                  : r.delayMinutes > 0
                                    ? "yellow"
                                    : "green"
                            }`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loadingRides && rides.length === 0 && (
              <p style={{ textAlign: "center", color: "#777", marginTop: 20 }}>
                Brak połączeń dla podanych parametrów.
              </p>
            )}
          </div>
        </section>

        {/* === MAPA POD PANELEM === */}
        <section className="map-section">
          <MapPage />
        </section>
      </main>
    </div>
  );
}
