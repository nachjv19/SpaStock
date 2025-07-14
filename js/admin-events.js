// admin-events.js
import axios from "axios";

const form = document.getElementById("event-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const date = document.getElementById("date").value;

  if (!title || !description || !date) return alert("Todos los campos son obligatorios");

  const newEvent = {
    title,
    description,
    date,
    participants: []
  };

  try {
    await axios.post("http://localhost:3001/events", newEvent);
    alert("Evento creado correctamente");
    form.reset();
  } catch (err) {
    console.error("Error creando evento", err);
    alert("Ocurrió un error al crear el evento");
  }
});
