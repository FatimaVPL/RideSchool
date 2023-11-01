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
        return { uri: require('../../../assets/Insignias/medalla-de-Oro.png'), text: "Oro", opacity: 1 };
    } else if (num >= 50) {
        return { uri: require('../../../assets/Insignias/medalla-de-Plata.png'), text: "Plata", opacity: 1 };
    } else if (num >= 30) {
        return { uri: require('../../../assets/Insignias/medalla-de-Bronce.png'), text: "Bronce", opacity: 1 };
    } else {
        return { uri: require('../../../assets/Insignias/medalla-de-Bronce.png'), text: "Bronce", opacity: 0.4 };
    }
}

export function cut(name, lastName) {
    const arregloName = name.split(' ', 2);
    const arregloLastName = lastName.split(' ', 2);
    
    return `${arregloName[0]} ${arregloLastName[0]}`;
}

export function formatDate(timestamp, monthType) {
    var fecha = new Date(timestamp?.seconds * 1000);
    if (monthType === null) {
        var opcionesFormato = {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }
    } else {
        var opcionesFormato = {
            year: 'numeric',
            month: monthType,
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        }
    }
    return fecha.toLocaleString('es-ES', opcionesFormato);
}