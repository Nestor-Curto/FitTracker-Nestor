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
 ABRIR PANEL DE EXPORTACIÓN
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

        /*
        Proponemos automáticamente como rango
        todo el histórico disponible.
        Después puedes cambiar las fechas.
        */

        exportarDesde.value =
            obtenerFechaOrdenable(
                registros[0].fecha
            );


        exportarHasta.value =
            obtenerFechaOrdenable(
                registros[
                    registros.length - 1
                ].fecha
            );


        panelExportacion.style.display =
            "block";


        panelExportacion.scrollIntoView({

            behavior:"smooth",

            block:"center"

        });

});


/*==================================================
 CANCELAR EXPORTACIÓN
==================================================*/

cancelarExportacion
    .addEventListener("click",()=>{

        panelExportacion.style.display =
            "none";

});


/*==================================================
 EXPORTAR RANGO DE FECHAS
==================================================*/

confirmarExportacion
    .addEventListener("click",()=>{

        const desde =
            exportarDesde.value;


        const hasta =
            exportarHasta.value;


        if(!desde || !hasta){

            alert(
                "Selecciona la fecha Desde y la fecha Hasta."
            );

            return;

        }


        if(desde > hasta){

            alert(
                "La fecha Desde no puede ser posterior a la fecha Hasta."
            );

            return;

        }


        ordenarRegistros();


        const registrosSeleccionados =
            registros.filter(registro=>{

                const fechaRegistro =
                    obtenerFechaOrdenable(
                        registro.fecha
                    );


                return (
                    fechaRegistro >= desde &&
                    fechaRegistro <= hasta
                );

            });


        if(
            registrosSeleccionados.length === 0
        ){

            alert(
                "No hay registros dentro de las fechas seleccionadas."
            );

            return;

        }


        /*
        Solo exportamos una COPIA de los registros
        seleccionados.

        El histórico original NO se modifica.
        */

        const datosExportacion = {

            aplicacion:
                "FitTracker Néstor/Uxua",

            version:
                "0.3.2",

            altura:
                ALTURA,

            pesoInicial:
                PESO_INICIAL,

            pesoObjetivo:
                pesoObjetivo,

            periodo:{

                desde:desde,

                hasta:hasta

            },

            numeroRegistros:
                registrosSeleccionados.length,

            fechaExportacion:
                new Date().toISOString(),

            registros:
                registrosSeleccionados

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
                    type:
                        "application/json"
                }

            );


        const url =
            URL.createObjectURL(blob);


        const enlace =
            document.createElement("a");


        enlace.href =
            url;


        enlace.download =
            `fittracker-${desde}-a-${hasta}.json`;


        document.body
            .appendChild(enlace);


        enlace.click();


        enlace.remove();


        URL.revokeObjectURL(url);


        panelExportacion.style.display =
            "none";


        alert(

            `✅ Exportados ${registrosSeleccionados.length} registros.\n\nDesde: ${mostrarFechaRegistro(desde)}\nHasta: ${mostrarFechaRegistro(hasta)}`

        );

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
                        eventoLectura
                            .target
                            .result
                    );


                let registrosImportados;


                /*
                Compatible con los JSON antiguos,
                donde el archivo era directamente
                un array de registros.
                */

                if(Array.isArray(datos)){

                    registrosImportados =
                        datos;

                }

                /*
                Compatible con las exportaciones
                nuevas de FitTracker.
                */

                else if(
                    datos &&
                    Array.isArray(
                        datos.registros
                    )
                ){

                    registrosImportados =
                        datos.registros;

                }

                else{

                    throw new Error(
                        "Formato no válido"
                    );

                }


                const registrosValidos =
                    registrosImportados
                        .filter(
                            registro =>
                                registro &&
                                registro.fecha
                        );


                if(
                    registrosValidos.length === 0
                ){

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


                registroEditando =
                    null;


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


        lector.readAsText(
            archivo
        );

});


/*==================================================
 INICIALIZACIÓN FINAL
==================================================*/

actualizarDashboard();

pintarHistorial();
