/*==================================================
 FITTRACKER NÉSTOR
 Versión 0.3.1
==================================================*/


/*==================================================
 CONFIGURACIÓN
==================================================*/

const ALTURA = 1.86;
const PESO_INICIAL = 101;
const PESO_OBJETIVO = 92;

/*
 IMPORTANTE:
 Mantenemos la misma clave para conservar
 todos los registros actuales.
*/

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

const fechaRegistro = document.getElementById("fechaRegistro");

const guardarBtn = document.getElementById("guardar");

const tablaHistorial =
    document.querySelector("#tablaHistorial tbody");

const archivoImportar =
    document.getElementById("archivoImportar");


/*==================================================
 FECHA ACTUAL
==================================================*/

function obtenerFechaHoy(){

    const hoy = new Date();

    const year = hoy.getFullYear();

    const month = String(
        hoy.getMonth() + 1
    ).padStart(2,"0");

    const day = String(
        hoy.getDate()
    ).padStart(2,"0");

    return `${year}-${month}-${day}`;

}


function mostrarFecha(){

    const hoy = new Date();

    fecha.textContent = hoy.toLocaleDateString(
        "es-ES",
        {

            weekday:"long",

            day:"numeric",

            month:"long",

            year:"numeric"

        }
    );

}


/*==================================================
 CONVERTIR FECHAS
==================================================*/

function obtenerFechaOrdenable(fecha){

    if(!fecha){

        return "";

    }

    /*
    Formato nuevo:
    2026-07-11
    */

    if(fecha.includes("-")){

        return fecha;

    }

    /*
    Formato antiguo:
    11/7/2026
    */

    const partes = fecha.split("/");

    if(partes.length === 3){

        const dia = partes[0].padStart(2,"0");

        const mes = partes[1].padStart(2,"0");

        const year = partes[2];

        return `${year}-${mes}-${dia}`;

    }

    return fecha;

}


function mostrarFechaRegistro(fecha){

    const fechaOrdenable =
        obtenerFechaOrdenable(fecha);

    const partes =
        fechaOrdenable.split("-");

    if(partes.length !== 3){

        return fecha;

    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


/*==================================================
 ORDENAR REGISTROS
==================================================*/

function ordenarRegistros(){

    registros.sort((a,b)=>{

        return obtenerFechaOrdenable(a.fecha)
            .localeCompare(
                obtenerFechaOrdenable(b.fecha)
            );

    });

}


/*==================================================
 LOCAL STORAGE
==================================================*/

function cargarDatos(){

    try{

        const datos =
            localStorage.getItem(STORAGE_KEY);

        if(datos){

            registros = JSON.parse(datos);

            if(!Array.isArray(registros)){

                registros = [];

            }

        }else{

            registros = [];

        }

        ordenarRegistros();

    }catch(error){

        console.error(
            "Error cargando los datos:",
            error
        );

        registros = [];

    }

}


function guardarDatos(){

    ordenarRegistros();

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


    const pantalla =
        document.getElementById(id);

    if(pantalla){

        pantalla.classList.add("active");

    }


    const botonActivo =
        document.querySelector(
            `[data-screen="${id}"]`
        );

    if(botonActivo){

        botonActivo.classList.add("active");

    }


    if(id === "inicio"){

        actualizarDashboard();

    }


    if(id === "historial"){

        pintarHistorial();

    }

}


navBtns.forEach(btn=>{

    btn.addEventListener("click",()=>{

        mostrarPantalla(
            btn.dataset.screen
        );

    });

});


/*==================================================
 FUNCIONES AUXILIARES
==================================================*/

function valor(id){

    const elemento =
        document.getElementById(id);

    return elemento
        ? elemento.value
        : "";

}


function limpiarFormulario(){

    document
        .querySelectorAll(
            "#registrar input, #registrar textarea"
        )
        .forEach(campo=>{

            campo.value = "";

        });

    fechaRegistro.value =
        obtenerFechaHoy();

}


/*==================================================
 INICIALIZACIÓN DE FECHA
==================================================*/

mostrarFecha();

fechaRegistro.value =
    obtenerFechaHoy();

cargarDatos();
/*==================================================
 GUARDAR / ACTUALIZAR REGISTRO
==================================================*/

guardarBtn.addEventListener(
    "click",
    guardarRegistro
);


function guardarRegistro(){

    const fechaSeleccionada =
        valor("fechaRegistro");


    if(!fechaSeleccionada){

        alert(
            "Selecciona una fecha para el registro."
        );

        return;

    }


    const registro = {

        id:
            registroEditando !== null
                ? registroEditando
                : Date.now(),

        fecha: fechaSeleccionada,

        pesoManana:
            parseFloat(
                valor("pesoManana")
            ) || 0,

        abdomenManana:
            parseFloat(
                valor("abdomenManana")
            ) || 0,

        pesoNoche:
            parseFloat(
                valor("pesoNoche")
            ) || 0,

        abdomenNoche:
            parseFloat(
                valor("abdomenNoche")
            ) || 0,

        agua:
            parseFloat(
                valor("agua")
            ) || 0,

        sueno:
            parseFloat(
                valor("sueno")
            ) || 0,

        pasos:
            parseInt(
                valor("pasos")
            ) || 0,

        entreno:
            valor("entreno"),

        desayuno:
            valor("desayuno"),

        comida:
            valor("comida"),

        cena:
            valor("cena"),

        energia:
            parseFloat(
                valor("energia")
            ) || 0,

        hambre:
            parseFloat(
                valor("hambre")
            ) || 0,

        notas:
            valor("notas")

    };


    if(registroEditando !== null){

        const indice =
            registros.findIndex(
                r => r.id === registroEditando
            );


        if(indice !== -1){

            registros[indice] = registro;

        }


        registroEditando = null;

    }else{

        const existeFecha =
            registros.find(
                r =>
                    obtenerFechaOrdenable(r.fecha)
                    === fechaSeleccionada
            );


        if(existeFecha){

            const confirmar = confirm(
                "Ya existe un registro para esta fecha. ¿Quieres guardar otro registro igualmente?"
            );


            if(!confirmar){

                return;

            }

        }


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

    const pesoNumerico =
        Number(peso);


    if(!pesoNumerico){

        return "—";

    }


    return (

        pesoNumerico /
        (ALTURA * ALTURA)

    ).toFixed(1);

}


/*==================================================
 DIFERENCIA DE PESO
==================================================*/

function calcularVariacion(indice){

    if(indice === 0){

        return {

            texto:"—",

            clase:"igualPeso"

        };

    }


    const actual =
        Number(
            registros[indice].pesoManana
        );


    const anterior =
        Number(
            registros[indice - 1].pesoManana
        );


    if(!actual || !anterior){

        return {

            texto:"—",

            clase:"igualPeso"

        };

    }


    const diferencia =
        actual - anterior;


    if(diferencia < 0){

        return {

            texto:
                `🟢 ${diferencia.toFixed(1)} kg`,

            clase:"bajaPeso"

        };

    }


    if(diferencia > 0){

        return {

            texto:
                `🔴 +${diferencia.toFixed(1)} kg`,

            clase:"subePeso"

        };

    }


    return {

        texto:"⚪ 0.0 kg",

        clase:"igualPeso"

    };

}


/*==================================================
 DASHBOARD
==================================================*/

function actualizarDashboard(){

    ordenarRegistros();


    if(registros.length === 0){

        document
            .getElementById("pesoActual")
            .textContent = "--";


        document
            .getElementById("abdomenActual")
            .textContent = "--";


        document
            .getElementById("diasRegistrados")
            .textContent = "0";


        document
            .getElementById("ultimoEntreno")
            .textContent = "--";


        document
            .getElementById("suenoMedio")
            .textContent = "--";


        document
            .getElementById("pesoPerdido")
            .textContent = "--";


        document
            .getElementById("pesoRestante")
            .textContent = "--";


        document
            .getElementById("barraProgreso")
            .style.width = "0%";


        return;

    }


    const ultimo =
        registros[
            registros.length - 1
        ];


    const pesoActual =
        Number(
            ultimo.pesoManana
        );


    const abdomenActual =
        Number(
            ultimo.abdomenManana
        );


    document
        .getElementById("pesoActual")
        .textContent = pesoActual
            ? pesoActual.toFixed(1) + " kg"
            : "--";


    document
        .getElementById("abdomenActual")
        .textContent = abdomenActual
            ? abdomenActual.toFixed(1) + " cm"
            : "--";


    document
        .getElementById("diasRegistrados")
        .textContent = registros.length;


    const ultimoConEntreno =
        [...registros]
            .reverse()
            .find(
                r =>
                    r.entreno &&
                    r.entreno.trim() !== ""
            );


    document
        .getElementById("ultimoEntreno")
        .textContent =
            ultimoConEntreno
                ? ultimoConEntreno.entreno
                : "--";


    const registrosConSueno =
        registros.filter(
            r => Number(r.sueno) > 0
        );


    const mediaSueno =
        registrosConSueno.length
            ? registrosConSueno.reduce(
                (total,registro) =>
                    total +
                    Number(registro.sueno),
                0
            ) / registrosConSueno.length
            : 0;


    document
        .getElementById("suenoMedio")
        .textContent =
            mediaSueno
                ? mediaSueno.toFixed(1) + " h"
                : "--";


    if(pesoActual){

        const perdidos =
            PESO_INICIAL - pesoActual;


        const restantes =
            pesoActual - PESO_OBJETIVO;


        document
            .getElementById("pesoPerdido")
            .textContent =
                perdidos.toFixed(1) + " kg";


        document
            .getElementById("pesoRestante")
            .textContent =
                Math.max(
                    0,
                    restantes
                ).toFixed(1) + " kg";


        const progreso =

            (
                (
                    PESO_INICIAL -
                    pesoActual
                )
                /
                (
                    PESO_INICIAL -
                    PESO_OBJETIVO
                )
            )
            * 100;


        document
            .getElementById("barraProgreso")
            .style.width =

                Math.max(
                    0,
                    Math.min(
                        100,
                        progreso
                    )
                )
                + "%";

    }

}
/*==================================================
 HISTORIAL
==================================================*/

function pintarHistorial(){

    ordenarRegistros();

    tablaHistorial.innerHTML = "";


    registros.forEach((registro, indice)=>{

        const variacion =
            calcularVariacion(indice);


        const peso =
            Number(registro.pesoManana);


        const abdomen =
            Number(registro.abdomenManana);


        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>
                ${mostrarFechaRegistro(registro.fecha)}
            </td>

            <td>
                ${peso ? peso.toFixed(1) : "—"}
            </td>

            <td class="${variacion.clase}">
                ${variacion.texto}
            </td>

            <td>
                ${abdomen ? abdomen.toFixed(1) : "—"}
            </td>

            <td>
                ${calcularIMC(peso)}
            </td>

            <td>

                <div class="acciones">

                    <button
                        class="btnEditar"
                        onclick="editarRegistro(${registro.id})"
                        title="Editar">

                        ✏️

                    </button>

                    <button
                        class="btnEliminar"
                        onclick="eliminarRegistro(${registro.id})"
                        title="Eliminar">

                        🗑️

                    </button>

                </div>

            </td>

        `;


        tablaHistorial.appendChild(fila);

    });

}


/*==================================================
 EDITAR REGISTRO
==================================================*/

function editarRegistro(id){

    const registro =
        registros.find(
            r => r.id === id
        );


    if(!registro){

        return;

    }


    registroEditando = id;


    fechaRegistro.value =
        obtenerFechaOrdenable(
            registro.fecha
        );


    document
        .getElementById("pesoManana")
        .value =
            registro.pesoManana || "";


    document
        .getElementById("abdomenManana")
        .value =
            registro.abdomenManana || "";


    document
        .getElementById("pesoNoche")
        .value =
            registro.pesoNoche || "";


    document
        .getElementById("abdomenNoche")
        .value =
            registro.abdomenNoche || "";


    document
        .getElementById("agua")
        .value =
            registro.agua || "";


    document
        .getElementById("sueno")
        .value =
            registro.sueno || "";


    document
        .getElementById("pasos")
        .value =
            registro.pasos || "";


    document
        .getElementById("entreno")
        .value =
            registro.entreno || "";


    document
        .getElementById("desayuno")
        .value =
            registro.desayuno || "";


    document
        .getElementById("comida")
        .value =
            registro.comida || "";


    document
        .getElementById("cena")
        .value =
            registro.cena || "";


    document
        .getElementById("energia")
        .value =
            registro.energia || "";


    document
        .getElementById("hambre")
        .value =
            registro.hambre || "";


    document
        .getElementById("notas")
        .value =
            registro.notas || "";


    guardarBtn.textContent =
        "💾 Guardar cambios";


    mostrarPantalla("registrar");


    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

}


/*==================================================
 ELIMINAR REGISTRO
==================================================*/

function eliminarRegistro(id){

    const registro =
        registros.find(
            r => r.id === id
        );


    if(!registro){

        return;

    }


    const confirmar =
        confirm(

            `¿Eliminar el registro del ${mostrarFechaRegistro(registro.fecha)}?`

        );


    if(!confirmar){

        return;

    }


    registros =
        registros.filter(
            r => r.id !== id
        );


    if(registroEditando === id){

        registroEditando = null;

        limpiarFormulario();

        guardarBtn.textContent =
            "💾 Finalizar día";

    }


    guardarDatos();

    actualizarDashboard();

    pintarHistorial();

}


/*==================================================
 BORRAR HISTORIAL COMPLETO
==================================================*/

document
    .getElementById("borrarHistorial")
    .addEventListener("click",()=>{


        if(registros.length === 0){

            alert(
                "No hay registros para borrar."
            );

            return;

        }


        const confirmar =
            confirm(

                "¿Seguro que quieres borrar TODO el historial? Esta acción no se puede deshacer."

            );


        if(!confirmar){

            return;

        }


        const segundaConfirmacion =
            confirm(

                "Última confirmación: ¿borrar definitivamente todos los registros?"

            );


        if(!segundaConfirmacion){

            return;

        }


        registros = [];

        registroEditando = null;


        guardarDatos();

        limpiarFormulario();

        guardarBtn.textContent =
            "💾 Finalizar día";

        actualizarDashboard();

        pintarHistorial();

});
/*==================================================
 COPIAR RESUMEN DEL ÚLTIMO DÍA
==================================================*/

document
    .getElementById("copiar")
    .addEventListener("click", async ()=>{

        if(registros.length === 0){

            alert("No hay registros.");

            return;

        }

        ordenarRegistros();

        const r =
            registros[registros.length - 1];

        const resumen = `Fecha: ${mostrarFechaRegistro(r.fecha)}

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

${r.entreno || "No"}

🍞 Desayuno:

${r.desayuno || "No"}

🍽️ Comida:

${r.comida || "No"}

🌙 Cena:

${r.cena || "No"}

😊 Energía: ${r.energia}/5

😋 Hambre: ${r.hambre}/5

📝 Observaciones:

${r.notas || "Sin observaciones"}`;


        try{

            await navigator.clipboard
                .writeText(resumen);

            alert("📋 Resumen copiado.");

        }catch(error){

            alert(
                "No se ha podido copiar el resumen."
            );

        }

});


/*==================================================
 EXPORTAR HISTÓRICO COMPLETO
==================================================*/

document
    .getElementById("exportar")
    .addEventListener("click",()=>{

        if(registros.length === 0){

            alert(
                "No hay registros para exportar."
            );

            return;

        }

        ordenarRegistros();

        const datosExportacion = {

            aplicacion:"FitTracker Néstor",

            version:"0.3.1",

            altura:ALTURA,

            pesoInicial:PESO_INICIAL,

            pesoObjetivo:PESO_OBJETIVO,

            fechaExportacion:
                new Date().toISOString(),

            registros:registros

        };


        const blob =
            new Blob(

                [
                    JSON.stringify(
                        datosExportacion,
                        null,
                        2
                    )
                ],

                {
                    type:"application/json"
                }

            );


        const url =
            URL.createObjectURL(blob);


        const enlace =
            document.createElement("a");


        enlace.href = url;

        enlace.download =
            `fittracker-backup-${obtenerFechaHoy()}.json`;


        document.body.appendChild(enlace);

        enlace.click();

        enlace.remove();


        URL.revokeObjectURL(url);

});


/*==================================================
 IMPORTAR HISTÓRICO COMPLETO
==================================================*/

document
    .getElementById("importar")
    .addEventListener("click",()=>{

        archivoImportar.value = "";

        archivoImportar.click();

});


archivoImportar
    .addEventListener("change", evento=>{

        const archivo =
            evento.target.files[0];


        if(!archivo){

            return;

        }


        const lector =
            new FileReader();


        lector.onload = eventoLectura=>{

            try{

                const datos =
                    JSON.parse(
                        eventoLectura.target.result
                    );


                let registrosImportados;


                if(Array.isArray(datos)){

                    /*
                    Compatible con exportaciones
                    antiguas de FitTracker.
                    */

                    registrosImportados = datos;

                }else if(
                    datos &&
                    Array.isArray(datos.registros)
                ){

                    registrosImportados =
                        datos.registros;

                }else{

                    throw new Error(
                        "Formato no válido"
                    );

                }


                const registrosValidos =
                    registrosImportados.filter(
                        registro =>
                            registro &&
                            registro.fecha
                    );


                if(registrosValidos.length === 0){

                    throw new Error(
                        "No hay registros válidos"
                    );

                }


                const confirmar =
                    confirm(

                        `Se han encontrado ${registrosValidos.length} registros.\n\n¿Quieres REEMPLAZAR el historial actual por el historial importado?`

                    );


                if(!confirmar){

                    return;

                }


                registros =
                    registrosValidos.map(
                        (registro,indice)=>({

                            ...registro,

                            id:
                                registro.id ??
                                (
                                    Date.now()
                                    + indice
                                )

                        })
                    );


                registroEditando = null;


                guardarDatos();

                limpiarFormulario();

                guardarBtn.textContent =
                    "💾 Finalizar día";

                actualizarDashboard();

                pintarHistorial();


                alert(

                    `✅ Importación completada.\n\n${registros.length} registros recuperados.`

                );


                mostrarPantalla(
                    "historial"
                );


            }catch(error){

                console.error(
                    "Error importando:",
                    error
                );


                alert(

                    "❌ No se ha podido importar el archivo. Comprueba que sea una copia JSON válida de FitTracker."

                );

            }

        };


        lector.readAsText(archivo);

});


/*==================================================
 INICIALIZACIÓN FINAL
==================================================*/

actualizarDashboard();

pintarHistorial();
