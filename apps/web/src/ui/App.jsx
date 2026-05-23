import { useEffect, useMemo, useState } from "react";
import { api } from "./api.js";

export function App() {
  const [stage, setStage] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const isLogged = useMemo(() => Boolean(token), [token]);

  useEffect(() => {
    if (!isLogged) return;
    api.getEvents().then((data) => setEvents(data.events || []));
  }, [isLogged]);

  const handleRegister = async () => {
    try {
      setMessage("");
      const data = await api.register(email, password);
      setToken(data.token);
      setStage("events");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleLogin = async () => {
    try {
      setMessage("");
      const data = await api.login(email, password);
      setToken(data.token);
      setStage("events");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleCheckout = async () => {
    if (!selectedEvent) {
      setMessage("Selecciona un evento primero.");
      return;
    }
    try {
      setMessage("");
      const data = await api.createOrder(token, selectedEvent.id, quantity);
      setMessage(`Compra confirmada. Orden #${data.orderId}`);
      setStage("confirm");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleStartOver = () => {
    setStage("events");
    setSelectedEvent(null);
    setQuantity(1);
    setMessage("");
  };

  const handleLogout = () => {
    setToken(null);
    setStage("login");
    setSelectedEvent(null);
    setQuantity(1);
    setMessage("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Ticketing Demo</p>
          <h1>Venta de boletos en tiempo real</h1>
          <p className="subtitle">
            Un flujo completo de compra con pruebas dinamicas y CI/CD.
          </p>
        </div>
        <div className="hero-card">
          <h2>Estado</h2>
          <p>{isLogged ? "Sesion activa" : "Sesion no iniciada"}</p>
          <p className="small">{token ? "JWT listo" : "Sin token"}</p>
          {isLogged && (
            <button className="ghost" onClick={handleLogout}>
              Cerrar sesion
            </button>
          )}
        </div>
      </header>

      <main className="content">
        {stage === "login" && (
          <section className="panel">
            <h2>Acceso</h2>
            <p className="small">
              Usa un correo real para probar el registro y login.
            </p>
            {message && <p className="alert">{message}</p>}
            <label className="field">
              Correo
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@correo.com"
              />
            </label>
            <label className="field">
              Contrasena
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
              />
            </label>
            <div className="actions">
              <button className="primary" onClick={handleRegister}>
                Registrarse
              </button>
              <button className="ghost" onClick={handleLogin}>
                Ingresar
              </button>
            </div>
          </section>
        )}

        {stage === "events" && (
          <section className="panel">
            <h2>Eventos disponibles</h2>
            {message && <p className="alert">{message}</p>}
            <div className="grid">
              {events.map((event) => (
                <button
                  key={event.id}
                  className={
                    selectedEvent?.id === event.id ? "card selected" : "card"
                  }
                  onClick={() => setSelectedEvent(event)}
                >
                  <h3>{event.title}</h3>
                  <p>{event.city}</p>
                  <p>{new Date(event.date).toLocaleDateString("es-MX")}</p>
                  <p className="price">${event.price}</p>
                  <span>{event.available} disponibles</span>
                </button>
              ))}
            </div>
            {selectedEvent && (
              <div className="checkout">
                <h3>Checkout</h3>
                <label className="field">
                  Cantidad
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </label>
                <button className="primary" onClick={handleCheckout}>
                  Comprar
                </button>
              </div>
            )}
          </section>
        )}

        {stage === "confirm" && (
          <section className="panel">
            <h2>Confirmacion</h2>
            <p>{message}</p>
            <button className="ghost" onClick={handleStartOver}>
              Comprar otro
            </button>
            <button className="primary" onClick={handleLogout}>
              Cerrar sesion
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
