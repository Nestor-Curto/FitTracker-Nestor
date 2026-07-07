// Mostrar la fecha actual
const fecha = document.getElementById("fecha");

const hoy = new Date();

fecha.textContent = hoy.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
});

// Botones
const guardarBtn = document.getElementById("guardar");
const historialBtn = document.getElementById("historial");
const copiarBtn = document.getElementById("copiar");

// Guardar registro
guardarBtn.addEventListener("click", () => {

    const registro = {
        fecha: hoy.toLocaleDateString(),

        pesoManana: document.getElementById("pesoManana").value,
        abdomenManana: document.getElementById("abdomenManana").value,

        pesoNoche: document.getElementById("pesoNoche").value,
        abdomenNoche: document.getElementById("abdomenNoche").value,

        agua: document.getElementById("agua").value,
        sueno: document.getElementById("sueno").value,
        pasos: document.getElementById("pasos").value,

        entrenamiento: document.getElementById("entreno").value,

        desayuno: document.getElementById("desayuno").value,
        comida: document.getElementById("comida").value,
        cena: document.getElementById("cena").value,

        energia: document.getElementById("energia").value,
        hambre: document.getElementById("hambre").value,

        notas: document.getElementById("notas").value
    };

    let historial = JSON.parse(localStorage.getItem("fittracker")) || [];

    historial.push(registro);

    localStorage.setItem("fittracker", JSON.stringify(historial));

    alert("✅ Día guardado correctamente");
});

// Mostrar historial
historialBtn.addEventListener("click", () => {

    const historial = JSON.parse(localStorage.getItem("fittracker")) || [];

    if (historial.length === 0) {
        alert("Todavía no hay registros.");
        return;
    }

    let texto = "";

    historial.forEach((dia, i) => {
        texto += `${i + 1}. ${dia.fecha} - ${dia.pesoManana || "-"} kg\n`;
    });

    alert(texto);

});

// Copiar resumen
copiarBtn.addEventListener("click", () => {

    const historial = JSON.parse(localStorage.getItem("fittracker")) || [];

    if (historial.length === 0) {
        alert("No hay datos.");
        return;
    }

    const ultimo = historial[historial.length - 1];

    const resumen = `
Fecha: ${ultimo.fecha}

🌅 MAÑANA
Peso: ${ultimo.pesoManana} kg
Abdomen: ${ultimo.abdomenManana} cm

🌙 NOCHE
Peso: ${ultimo.pesoNoche} kg
Abdomen: ${ultimo.abdomenNoche} cm

💧 Agua: ${ultimo.agua} L
😴 Sueño: ${ultimo.sueno} h
🚶 Pasos: ${ultimo.pasos}

💪 Entrenamiento:
${ultimo.entrenamiento}

🍞 Desayuno:
${ultimo.desayuno}

🍽️ Comida:
${ultimo.comida}

🌙 Cena:
${ultimo.cena}

😊 Energía: ${ultimo.energia}/5
😋 Hambre: ${ultimo.hambre}/5

📝 Observaciones:
${ultimo.notas}
`;

    navigator.clipboard.writeText(resumen);

    alert("📋 Resumen copiado al portapapeles.");

});