/*==================================================
 FITTRACKER NÉSTOR
 Versión 0.3
==================================================*/


/*==================================================
 CONFIGURACIÓN
==================================================*/

const ALTURA = 1.86;
const PESO_INICIAL = 101;
const PESO_OBJETIVO = 92;
const STORAGE_KEY = "fittracker_registros";


/*==================================================
 VARIABLES
==================================================*/

let registros = [];
let registroEditando = null;


/*==================================================
 ELEMENTOS DEL DOM
==================================================*/

const screens = document.querySelectorAll(".screen");
const navBtns = document.querySelectorAll(".navBtn");

const fecha = document.getElementById("fecha");

const guardarBtn = document.getElementById("guardar");

const tablaHistorial = document.querySelector("#tablaHistorial tbody");


/*==================================================
 FECHA
==================================================*/

function mostrarFecha() {

    const hoy = new Date();

    fecha.textContent = hoy.toLocaleDateString("es-ES", {

        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"

    });

}


/*==================================================
 LOCAL STORAGE
==================================================*/

function cargarDatos() {

    const datos = localStorage.getItem(STORAGE_KEY);

    if(datos){

        registros = JSON.parse(datos);

    }else{

        registros = [];

    }

}


function guardarDatos(){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(registros)

    );

}


/*==================================================
 NAVEGACIÓN
==================================================*/

function mostrarPantalla(id){

    screens.forEach(screen=>{

        screen.classList.remove("active");

    });

    navBtns.forEach(btn=>{

        btn.classList.remove("active");

    });

    document
        .getElementById(id)
        .classList
        .add("active");

    document
        .querySelector(`[data-screen="${id}"]`)
        .classList
        .add("active");

}


navBtns.forEach(btn=>{

    btn.addEventListener("click",()=>{

        mostrarPantalla(btn.dataset.screen);

        if(btn.dataset.screen==="inicio"){

            actualizarDashboard();

        }

        if(btn.dataset.screen==="historial"){

            pintarHistorial();

        }

    });

});


/*==================================================
 FUNCIONES AUXILIARES
==================================================*/

function valor(id){

    return document.getElementById(id).value;

}


function limpiarFormulario(){

    document
        .querySelectorAll("input, textarea")
        .forEach(campo=>{

            campo.value="";

        });

}


/*==================================================
 INICIALIZACIÓN
==================================================*/

mostrarFecha();

cargarDatos();
/*==================================================
 GUARDAR REGISTRO
==================================================*/

guardarBtn.addEventListener("click", guardarRegistro);

function guardarRegistro(){

    const registro={

        id: registroEditando ?? Date.now(),

        fecha:new Date().toLocaleDateString("es-ES"),

        pesoManana:parseFloat(valor("pesoManana")) || 0,

        abdomenManana:parseFloat(valor("abdomenManana")) || 0,

        pesoNoche:parseFloat(valor("pesoNoche")) || 0,

        abdomenNoche:parseFloat(valor("abdomenNoche")) || 0,

        agua:parseFloat(valor("agua")) || 0,

        sueno:parseFloat(valor("sueno")) || 0,

        pasos:parseInt(valor("pasos")) || 0,

        entreno:valor("entreno"),

        desayuno:valor("desayuno"),

        comida:valor("comida"),

        cena:valor("cena"),

        energia:parseFloat(valor("energia")) || 0,

        hambre:parseFloat(valor("hambre")) || 0,

        notas:valor("notas")

    };

    if(registroEditando){

        const indice=registros.findIndex(r=>r.id===registroEditando);

        registros[indice]=registro;

        registroEditando=null;

    }else{

        registros.push(registro);

    }

    guardarDatos();

    limpiarFormulario();

    actualizarDashboard();

    pintarHistorial();

    mostrarPantalla("inicio");

}


/*==================================================
 IMC
==================================================*/

function calcularIMC(peso){

    if(!peso) return "";

    return (peso/(ALTURA*ALTURA)).toFixed(1);

}


/*==================================================
 DIFERENCIA DE PESO
==================================================*/

function calcularVariacion(indice){

    if(indice===0){

        return{

            texto:"—",

            clase:"igualPeso"

        };

    }

    const actual=registros[indice].pesoManana;

    const anterior=registros[indice-1].pesoManana;

    const diferencia=(actual-anterior).toFixed(1);

    if(diferencia<0){

        return{

            texto:`${diferencia} kg`,

            clase:"bajaPeso"

        };

    }

    if(diferencia>0){

        return{

            texto:`+${diferencia} kg`,

            clase:"subePeso"

        };

    }

    return{

        texto:"0.0 kg",

        clase:"igualPeso"

    };

}


/*==================================================
 DASHBOARD
==================================================*/

function actualizarDashboard(){

    if(registros.length===0){

        return;

    }

    const ultimo=registros[registros.length-1];

    document.getElementById("pesoActual").textContent=
        ultimo.pesoManana.toFixed(1)+" kg";

    document.getElementById("abdomenActual").textContent=
        ultimo.abdomenManana.toFixed(1)+" cm";

    document.getElementById("diasRegistrados").textContent=
        registros.length;

    document.getElementById("ultimoEntreno").textContent=
        ultimo.entreno || "--";

    const mediaSueno=
        registros.reduce((a,b)=>a+b.sueno,0)/registros.length;

    document.getElementById("suenoMedio").textContent=
        mediaSueno.toFixed(1)+" h";

    const perdidos=PESO_INICIAL-ultimo.pesoManana;

    document.getElementById("pesoPerdido").textContent=
        perdidos.toFixed(1)+" kg";

    document.getElementById("pesoRestante").textContent=
        (ultimo.pesoManana-PESO_OBJETIVO).toFixed(1)+" kg";

    const progreso=
        ((PESO_INICIAL-ultimo.pesoManana)/
        (PESO_INICIAL-PESO_OBJETIVO))*100;

    document.getElementById("barraProgreso").style.width=
        Math.max(0,Math.min(100,progreso))+"%";

}
/*==================================================
 HISTORIAL
==================================================*/

function pintarHistorial(){

    tablaHistorial.innerHTML="";

    registros.forEach((registro,indice)=>{

        const variacion=calcularVariacion(indice);

        const fila=document.createElement("tr");

        fila.innerHTML=`

            <td>${registro.fecha}</td>

            <td>${registro.pesoManana.toFixed(1)}</td>

            <td class="${variacion.clase}">
                ${variacion.texto}
            </td>

            <td>${registro.abdomenManana.toFixed(1)}</td>

            <td>${calcularIMC(registro.pesoManana)}</td>

            <td>

                <div class="acciones">

                    <button
                        class="btnEditar"
                        onclick="editarRegistro(${registro.id})">

                        ✏️

                    </button>

                    <button
                        class="btnEliminar"
                        onclick="eliminarRegistro(${registro.id})">

                        🗑️

                    </button>

                </div>

            </td>

        `;

        tablaHistorial.appendChild(fila);

    });

}


/*==================================================
 EDITAR
==================================================*/

function editarRegistro(id){

    const registro=registros.find(r=>r.id===id);

    if(!registro) return;

    registroEditando=id;

    document.getElementById("pesoManana").value=registro.pesoManana;
    document.getElementById("abdomenManana").value=registro.abdomenManana;
    document.getElementById("pesoNoche").value=registro.pesoNoche;
    document.getElementById("abdomenNoche").value=registro.abdomenNoche;

    document.getElementById("agua").value=registro.agua;
    document.getElementById("sueno").value=registro.sueno;
    document.getElementById("pasos").value=registro.pasos;

    document.getElementById("entreno").value=registro.entreno;

    document.getElementById("desayuno").value=registro.desayuno;
    document.getElementById("comida").value=registro.comida;
    document.getElementById("cena").value=registro.cena;

    document.getElementById("energia").value=registro.energia;
    document.getElementById("hambre").value=registro.hambre;
    document.getElementById("notas").value=registro.notas;

    mostrarPantalla("registrar");

}


/*==================================================
 ELIMINAR REGISTRO
==================================================*/

function eliminarRegistro(id){

    if(!confirm("¿Eliminar este registro?")) return;

    registros=registros.filter(r=>r.id!==id);

    guardarDatos();

    actualizarDashboard();

    pintarHistorial();

}


/*==================================================
 BORRAR HISTORIAL
==================================================*/

document.getElementById("borrarHistorial").addEventListener("click",()=>{

    if(!confirm("¿Seguro que quieres borrar TODO el historial?")) return;

    registros=[];

    guardarDatos();

    actualizarDashboard();

    pintarHistorial();

});


/*==================================================
 COPIAR RESUMEN
==================================================*/

document.getElementById("copiar").addEventListener("click",()=>{

    if(registros.length===0){

        alert("No hay registros.");

        return;

    }

    const r=registros[registros.length-1];

    const resumen=`

Fecha: ${r.fecha}

🌅 MAÑANA

Peso: ${r.pesoManana} kg

Abdomen: ${r.abdomenManana} cm

🌙 NOCHE

Peso: ${r.pesoNoche} kg

Abdomen: ${r.abdomenNoche} cm

💧 Agua: ${r.agua} L

😴 Sueño: ${r.sueno} h

🚶 Pasos: ${r.pasos}

💪 Entrenamiento:

${r.entreno}

🍞 Desayuno:

${r.desayuno}

🍽️ Comida:

${r.comida}

🌙 Cena:

${r.cena}

😊 Energía: ${r.energia}/5

😋 Hambre: ${r.hambre}/5

📝 Observaciones:

${r.notas}

`;

    navigator.clipboard.writeText(resumen);

    alert("Resumen copiado.");

});


/*==================================================
 EXPORTAR / IMPORTAR
==================================================*/

document.getElementById("exportar").addEventListener("click",()=>{

    const blob=new Blob(

        [JSON.stringify(registros,null,2)],

        {type:"application/json"}

    );

    const enlace=document.createElement("a");

    enlace.href=URL.createObjectURL(blob);

    enlace.download="fittracker.json";

    enlace.click();

});


document.getElementById("importar").addEventListener("click",()=>{

    alert("La importación llegará en la versión 0.4.");

});


/*==================================================
 INICIO
==================================================*/

actualizarDashboard();

pintarHistorial();
