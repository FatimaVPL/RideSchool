export function getInfoByStatus(status) {
    switch (status) {
        case "en curso":
            return { color: "#B2D474", text: "Ir al chat" };
        case "aceptada":
            return { color: "#B2D474", text: "Ir al chat" };
        case "finalizado":
            return { color: "#EEBF55", text: "Nadota" };
        case "finalizada":
            return { color: "#EEBF55", text: "Nadota" };
        case "llego al destino":
            return { color: "#E88A1F", text: "Calificar" };
        default:
            return { color: "#EE6464", text: "Cancelar" };
    }
}

export function getInfoMedal(num) {
    if (num >= 100) {
        return "#E6BB3F";
    } else if (num >= 50) {
        return "#AAA499";
    } else if (num >= 30) {
        return "#BA9248";
    }
}

export function getInfoMedal2(num) {
    if (num >= 100) {
        return { color: "#E6BB3F", text: "Oro" };
    } else if (num >= 50) {
        return { color: "#AAA499", text: "Plata" };
    } else if (num >= 30) {
        return { color: "#BA9248", text: "Bronce" };
    } else {
        return false;
    }
}

export function cut(name, lastName) {
    const arregloName = name.split(' ', 2);
    const arregloLastName = lastName.split(' ', 2);
    
    return `${arregloName[0]} ${arregloLastName[0]}`;
}

export function formatDate(timestamp, monthType) {
    var fecha = new Date(timestamp?.seconds * 1000);
    var opcionesFormato = {
        year: 'numeric',
        month: monthType,
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    }
    return fecha.toLocaleString('es-ES', opcionesFormato);
}