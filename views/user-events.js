// user-events.js
import axios from "axios";

const user = JSON.parse(localStorage.getItem("currentUser"));
const eventsContainer = document.getElementById("events-container");

async function loadEvents() {
  try {
    const res = await axios.get("http://localhost:3001/events");
    eventsContainer.innerHTML = "";

    res.data.forEach(event => {
      const isRegistered = event.participants.includes(user.id);
      const eventDate = new Date(event.date).toLocaleDateString("es-CO");

      const card = document.createElement("div");
      card.innerHTML = `
        <h2>${event.title}</h2>
        <p>${event.description}</p>
        <p><strong>Fecha:</strong> ${eventDate}</p>
        <button data-id="${event.id}" ${isRegistered ? "disabled" : ""}>
          ${isRegistered ? "Ya registrado" : "Registrarse"}
        </button>
        <hr />
      `;
      eventsContainer.appendChild(card);
    });

    document.querySelectorAll("button[data-id]").forEach(btn => {
      btn.addEventListener("click", () => registerToEvent(btn.dataset.id));
    });

  } catch (err) {
    console.error("Error al cargar eventos", err);
  }
}

async function registerToEvent(eventId) {
  try {
    const eventRes = await axios.get(`http://localhost:3001/events/${eventId}`);
    const userRes = await axios.get(`http://localhost:3001/users/${user.id}`);

    await axios.patch(`http://localhost:3001/events/${eventId}`, {
      participants: [...eventRes.data.participants, user.id]
    });

    await axios.patch(`http://localhost:3001/users/${user.id}`, {
      registeredEvents: [...(userRes.data.registeredEvents || []), parseInt(eventId)]
    });

    alert("¡Te has registrado en el evento!");
    loadEvents();
  } catch (err) {
    console.error("Error al registrarse", err);
  }
}

loadEvents();
