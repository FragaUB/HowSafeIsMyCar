const URL_BASE = `https://api.nhtsa.gov/SafetyRatings`; 

// Variables para almacenar los elementos del DOM
let YEAR_SELECT = document.getElementById("year");
let MAKER_SELECT = document.getElementById("marca_auto");
let MODEL_SELECT = document.getElementById("modelo_auto");
let VERSION_SELECT = document.getElementById("version_auto");
let RESULTADOS_SPAN = document.getElementById("resultados");

// Variables de cada etiqueta
const IMG_FRONTAL = document.getElementById("img_frontal");
const IMG_LATERAL = document.getElementById("img_lateral");
const IMG_POSTE = document.getElementById("img_poste");
 
const RATING_FRENTE = document.getElementById("rating_frente");
const RATING_CONDUCTOR = document.getElementById("rating_conductor");
const RATING_PASAJERO = document.getElementById("rating_pasajero");
 
const RATING_LATERAL = document.getElementById("rating_lateral");
const RATING_CONDUCTOR_LATERAL = document.getElementById("rating_conductor_lateral");
const RATING_PASAJERO_LATERAL = document.getElementById("rating_pasajero_lateral");
 
const RATING_POSTE = document.getElementById("rating_poste");
const RATING_VUELCO = document.getElementById("rating_vuelco");
const RATING_PROBABILIDAD = document.getElementById("rating_probabilidad");

// marcas disponibles para un año dado
async function GetMakers(year) {
    let response = await fetch(`${URL_BASE}/modelyear/${year}?format=json`);
    let data = await response.json();
    return data.Results; 
}

// modelos de una marca en un año seleccionado
async function GetModels(year, maker) {
    let response = await fetch(`${URL_BASE}/modelyear/${year}/make/${maker}?format=json`);
    let data = await response.json();
    console.log(data.Results); 
    return data.Results; 
}

async function GetVersions(year, maker, model) {
    let response = await fetch(`${URL_BASE}/modelyear/${year}/make/${maker}/model/${model}?format=json`);
    let data = await response.json();
    return data.Results; 
}

async function GetVehicleInfo(vehicleId) {
    let response = await fetch(`${URL_BASE}/VehicleId/${vehicleId}?format=json`);
    let data = await response.json();
    return data.Results; 
}


// Limpia un select y le deja solo la opción por defecto, recibe el select, nombre del select a limpiar, y un placeholder que es el texto del select.
function ResetSelect(select, placeholder) {
    select.innerHTML = "";
    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = placeholder;
    select.appendChild(defaultOption);
}


// 7. FillSelect, fue hecho con el objectivo de hacer mas dinamica el flujo y evitar ciclos for en cada iteraccion. Lo que hace es lo siguiente: Recibe como paramtro de entradas, un select (el nombre del select donde a cargar), los items (el contenido a cargar), y fieldname que es el nombre que representa a cada select. 
function FillSelect(select, items, fieldName) {
    // Aca dice: para cada objecto de la repuesta, vas a hacer reiteradamente:
    items.forEach(item => {
        // creamos el option para tener una nueva opcion dentro del select.
        let option = document.createElement("option");
        //  el valor y texto a cargar lo vas a hacer en el select del item segun su nombre identificador.
        option.value = item[fieldName];
        option.text = item[fieldName];
        select.appendChild(option);
        // Vas a agregar en el select, las opciones.
    });
}

// 2. Es la segunda funcion en ejecutarse. Aca la funcion va a cargar los años.
function GetYears() {
    // Para hacerlo dinamico, la variable 'currentyear' va a almacenar el año actual, eso se logra a traves de la funcion 'new Date().getFullYear()' que nos devuelve el año actual.
    let currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2010; year--) {
        // Aca el for inicia en el año 'currentyear' y de manera decremental va a ir restando de a uno hasta llegar al año 2010, ya que el condicionante es mayor E IGUAL a 2010.
        // Por cada año que se cargue, se va a crear un nuevo elemento 'option'.
        let option = document.createElement("option");
        // A cada elemento 'option' se le va a asignar el valor del año y el texto que se va a mostrar en el select.
        option.value = year;
        option.text = year;
        // Finalmente, cada elemento 'option' se va a agregar esos años en el select que corresponde a los años.
        YEAR_SELECT.appendChild(option);
    }
}

// En vez de cargar con bucles for los resultados devueltos por cada "consulta/peticion" a la API, vamos a usar eventos JavaScript. 
// Un evento JavaScript es similar a un trigger (disparador) que se activa siempre y cuando ocurra (valla la redundacia) un evento en particular. En este caso, el evento es el "CHANGE". Osea, cuando se MODIFIQUE el valor de un select, va a ejecutarse lo que se encuentre dentro de la funcion. 
// Nota de Fran: La idea es explicar el flujo de la api para que vean como funciona.

// 3. Cuando SE SELECCIONE UN AÑO en particular desde el select. Va a ocurrir lo siguiente: 
YEAR_SELECT.addEventListener("change", async () => {
    // Almacenamos en memoria el año seleccionado por el usuario en la variable del select de año.
    let year = YEAR_SELECT.value;

    // Aca entra un poco de razonamiento logico, al modificar el select de año, vamos a "limpiar" los select de marca, modelo y version, ya que al cambiar el año, las marcas, modelos y versiones disponibles pueden variar.
    ResetSelect(MAKER_SELECT, "Seleccione una marca");
    ResetSelect(MODEL_SELECT, "Seleccione un modelo");
    ResetSelect(VERSION_SELECT, "Seleccione una versión");
    // En general al modificar algun select, limpiamos la repuestas (ya no tiene sentido mostrar algo que no pretende el usuario)
    RESULTADOS_SPAN.textContent = "";

    // Si el usuario no selecciona un año, no hacemos nada.
    if (!year) return; 

    //Aca vamos a intentar lo siguiente:
    try {
        // Aca vamos a obtener las marcas. 
        let makers = await GetMakers(year);
        // Les aconcejo ir a la funcion de FillSelect. Pero en resumen, cargamos en el select de marcas las marcas.
        FillSelect(MAKER_SELECT, makers, "Make");
    } catch (error) {
        console.error("Error al obtener las marcas:", error);
    }
});

// 4. Cuando SELECCIONAMOS UNA MARCA en particular desde el select. Va a ocurrir lo siguiente:
MAKER_SELECT.addEventListener("change", async () => {
    // Almacenamos en memoria el año y la marca seleccionada por el usuario en las variables del select de año y marca.
    let year = YEAR_SELECT.value;
    let maker = MAKER_SELECT.value;

    // Volvemos a reestablecer los select de modelo y version.
    ResetSelect(MODEL_SELECT, "Seleccione un modelo");
    ResetSelect(VERSION_SELECT, "Seleccione una versión");
    RESULTADOS_SPAN.textContent = "";

    if (!maker) return;

    try {
        // buscamos los modelos segun el año y marca de auto seleccionado.
        let models = await GetModels(year, maker);
        // los cargamos en el select
        FillSelect(MODEL_SELECT, models, "Model");
    } catch (error) {
        console.error("Error al obtener los modelos:", error);
    }
});

// 5. Cuando SELECCIONAMOS un modelo desde el select, ocurre los siguiente:
MODEL_SELECT.addEventListener("change", async () => {
    // Mismo rumbo: almacenamos lo seleccionado por el usuario desde el select
    let year = YEAR_SELECT.value;
    let maker = MAKER_SELECT.value;
    let model = MODEL_SELECT.value;

    // Solo reseteamos la vesion
    ResetSelect(VERSION_SELECT, "Seleccione una versión");
    RESULTADOS_SPAN.textContent = "";

    if (!model) return;

    // Chequeen esto:
    try {
        // Obtnemos las versiones del auto segun el año, marca y modelo.
        let versions = await GetVersions(year, maker, model);
 
        // PREVIO a cargar en select, vamos a filtrar.
        // Lo que hacemos es buscar la informacion de cada vesion, si llegase a ver alguna version SIN CALIFICACION FINAL, lo vamos a descartar.
        let versionesConInfo = await Promise.all(
            versions.map(async version => {
                try {
                    let info = await GetVehicleInfo(version.VehicleId);
                    let overallRating = info && info[0] ? info[0].OverallRating : undefined;
                    return { ...version, OverallRating: overallRating };
                } catch (err) {
                    console.error(`Error al obtener info del vehiculo ${version.VehicleId}:`, err);
                    return { ...version, OverallRating: undefined };
                }
            })
        );
 
        let versionesFiltradas = versionesConInfo.filter(version =>
            version.OverallRating !== "Not Rated" &&
            version.OverallRating !== "" &&
            version.OverallRating !== null &&
            version.OverallRating !== undefined &&
            version.OverallRating !== 0
        );
  
        VERSION_SELECT.dataset.versions = JSON.stringify(versionesFiltradas);
 
        // Similar a un bucle for, las versiones filtradas, la vamos a cargar en el select
        // Es la version sin FillSelect.
        versionesFiltradas.forEach(version => {
            let option = document.createElement("option");
            option.value = version.VehicleId;
            option.text = version.VehicleDescription;
            VERSION_SELECT.appendChild(option);
    });
    } catch (error) {
        console.error("Error al obtener las versiones:", error);
    }
});

VERSION_SELECT.addEventListener("change", async () => {
    let vehicleId = VERSION_SELECT.value;

    RESULTADOS_SPAN.textContent = "";

    if (!vehicleId) return;

    try {
        let vehicleInfo = await GetVehicleInfo(vehicleId);
        RESULTADOS_SPAN.textContent = JSON.stringify(vehicleInfo, null, 2);
        // La informacion a cargar, se la pasamos a una nueva funcion que "rendirizara" el contenido en la interfaz.
        Viewinfocar(vehicleInfo);
    } catch (error) {
        console.error("Error al obtener la info del vehículo:", error);
    }
});

function FormatRating(value) {
    if (value === undefined || value === null || value === "" || value === "Not Rated") {
        return "Sin calificación";
    }
    return `${value} ★`;
}

//6. En esta funcion que tiene como parametro de entrada la informacion.
function Viewinfocar(vehicleInfo) {
    // Aca vamos a camprobar algo: Si existe la informacion del vehiculo (osea que no sea nulo)
    let info = vehicleInfo && vehicleInfo[0] ? vehicleInfo[0] : {};
 
    //  Imágenes
    IMG_FRONTAL.src = info.FrontCrashPicture || IMG_PLACEHOLDER;
    IMG_LATERAL.src = info.SideCrashPicture || IMG_PLACEHOLDER;
    IMG_POSTE.src = info.SidePolePicture || IMG_PLACEHOLDER;
 
    //  Choque frontal 
    RATING_FRENTE.textContent = FormatRating(info.OverallFrontCrashRating);
    RATING_CONDUCTOR.textContent = FormatRating(info.FrontCrashDriversideRating);
    RATING_PASAJERO.textContent = FormatRating(info.FrontCrashPassengersideRating);
 
    //  Choque lateral 
    RATING_LATERAL.textContent = FormatRating(info.OverallSideCrashRating);
    RATING_CONDUCTOR_LATERAL.textContent = FormatRating(info.SideCrashDriversideRating);
    RATING_PASAJERO_LATERAL.textContent = FormatRating(info.SideCrashPassengersideRating);
 
    //  Choque contra poste y vuelco 
    RATING_POSTE.textContent = FormatRating(info.SidePoleCrashRating);
    RATING_VUELCO.textContent = FormatRating(info.RolloverRating);
    RATING_PROBABILIDAD.textContent = info.RolloverPossibility != null
        ? `${(info.RolloverPossibility * 100).toFixed(1)}% de probabilidad de vuelco`
        : "Sin datos";
}

// 0. Al inicializar el codigo JavaScript, siempre va a comenzar con la funcion main.
function main() {
    // 1. Como primera acccion que hacemos va a ser cargar los años.
    GetYears();
}

// 0.0: Aca invocamos la funcion main para que inicie con el codigo.
main();