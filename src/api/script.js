const URL_BASE = `https://api.nhtsa.gov/SafetyRatings`;

// Variables para almacenar los elementos del DOM
let YEAR_SELECT = document.getElementById("year");
let MAKER_SELECT = document.getElementById("marca_auto");
let MODEL_SELECT = document.getElementById("modelo_auto");
let VERSION_SELECT = document.getElementById("version_auto");
let RESULTADOS_SPAN = document.getElementById("resultados");

const REQUIRED_FIELDS = [
    "OverallRating",
    "FrontCrashPicture",
    "FrontCrashDriversideRating",
    "FrontCrashPassengersideRating",
    "OverallSideCrashRating",
    "SideCrashDriversideRating",
    "SideCrashPassengersideRating",
    "SideCrashPicture",
    "SidePoleCrashRating",
    "SidePolePicture",
    "RolloverRating",
    "RolloverPossibility",
];

const PICTURE_FIELDS = ["FrontCrashPicture", "SideCrashPicture", "SidePolePicture"];

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

// FUNCIONES QUE MANEJAN EL DOM (llenar selects, limpiar, etc.)

// Limpia un select y le deja solo la opción por defecto
function ResetSelect(select, placeholder) {
    select.innerHTML = "";
    let defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.text = placeholder;
    select.appendChild(defaultOption);
}

// Llena un select genérico a partir de un array y el nombre del campo a mostrar
function FillSelect(select, items, fieldName) {
    items.forEach(item => {
        let option = document.createElement("option");
        option.value = item[fieldName];
        option.text = item[fieldName];
        select.appendChild(option);
    });
}

function GetYears() {
    let currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2010; year--) {
        let option = document.createElement("option");
        option.value = year;
        option.text = year;
        YEAR_SELECT.appendChild(option);
    }
    console.log("Años cargados en el select");
}

// EVENTOS: cada select dispara la siguiente petición

// Cuando cambia el AÑO -> pedimos las marcas
YEAR_SELECT.addEventListener("change", async () => {
    let year = YEAR_SELECT.value;

    // reseteamos los select de marca, modelo y versión, y limpiamos el span de resultados
    ResetSelect(MAKER_SELECT, "Seleccione una marca");
    ResetSelect(MODEL_SELECT, "Seleccione un modelo");
    ResetSelect(VERSION_SELECT, "Seleccione una versión");
    RESULTADOS_SPAN.textContent = "";

    if (!year) return; 

    try {
        let makers = await GetMakers(year);
        FillSelect(MAKER_SELECT, makers, "Make");
    } catch (error) {
        console.error("Error al obtener las marcas:", error);
    }
});

// Cuando cambia la MARCA -> pedimos los modelos
MAKER_SELECT.addEventListener("change", async () => {
    let year = YEAR_SELECT.value;
    let maker = MAKER_SELECT.value;

    ResetSelect(MODEL_SELECT, "Seleccione un modelo");
    ResetSelect(VERSION_SELECT, "Seleccione una versión");
    RESULTADOS_SPAN.textContent = "";

    if (!maker) return;

    try {
        let models = await GetModels(year, maker);
        FillSelect(MODEL_SELECT, models, "Model");
    } catch (error) {
        console.error("Error al obtener los modelos:", error);
    }
});

// Cuando cambia el MODELO -> pedimos las versiones
MODEL_SELECT.addEventListener("change", async () => {
    let year = YEAR_SELECT.value;
    let maker = MAKER_SELECT.value;
    let model = MODEL_SELECT.value;

    ResetSelect(VERSION_SELECT, "Seleccione una versión");
    RESULTADOS_SPAN.textContent = "";

    if (!model) return;

    try {
        let versions = await GetVersions(year, maker, model);
        // Guardamos las versiones completas para no tener que volver a pedirlas
        VERSION_SELECT.dataset.versions = JSON.stringify(versions);

        versions.forEach(version => {
            let option = document.createElement("option");
            option.value = version.VehicleId;
            option.text = version.VehicleDescription;
            VERSION_SELECT.appendChild(option);
        });
    } catch (error) {
        console.error("Error al obtener las versiones:", error);
    }
});

// Cuando cambia la VERSIÓN -> pedimos la info final del coche
VERSION_SELECT.addEventListener("change", async () => {
    let vehicleId = VERSION_SELECT.value;

    RESULTADOS_SPAN.textContent = "";

    if (!vehicleId) return;

    try {
        let vehicleInfo = await GetVehicleInfo(vehicleId);
        RESULTADOS_SPAN.textContent = JSON.stringify(vehicleInfo, null, 2);
        console.log(vehicleInfo);
    } catch (error) {
        console.error("Error al obtener la info del vehículo:", error);
    }
});

// Función principal
function main() {
    GetYears();
}

main();