import { db } from "../../../config-firebase";
import { sendNotification } from "../../../hooks/Notifications";

//Enviar calificacion general al ride
export async function updateRating({ comentario = "", puntaje = 3, id = "", fileName }) {
    const reference = db.collection('rides').doc(id);

    try {
        const doc = await reference.get();
        if (doc.exists) {
            reference.update({
                [fileName]: { comentario, puntaje }
            });
        }
    } catch (error) {
        console.log('Error al actualizar', error);
    } 
}

//Eliminar documento
export async function deleteDoc(id, collection) {
    var reference = db.collection(collection).doc(id);
    await reference.delete()
        .then(() => {
            console.log("Documento eliminado exitosamente");
        })
        .catch((error) => {
            console.error("Error al eliminar el documento: ", error);
        });
}

//Actualizar el estado del ride a EN CURSO
//Estado de la oferta a ACEPTADA
//Estado de las otras ofertas a DESCARTADAS
//Enviar notificacion al conductor
export async function updateRide(ofertas, index, rideID) {
    const oferta = ofertas[index].oferta;
    const referenceConductor = oferta.conductorID.reference;
    const referenceRide = oferta.rideID.reference;
    const referenceOferta = db.collection('ofertas').doc(oferta.id);

    sendNotification(
        referenceConductor,
        'Oferta Aceptada',
        'Dirígete al punto de encuentro',
        'GestionarOfertas'
    );

    try {
        const doc = await referenceRide.get();
        if (doc.exists) {
            referenceRide.update({
                estado: "en curso",
                ofertaID: referenceOferta,
                conductorID: oferta.conductorID
            });
        }
    } catch (error) {
        console.log('Error al actualizar', error);
    }

    try {
        const doc = await referenceOferta.get();
        if (doc.exists) {
            referenceOferta.update({
                estado: "aceptada"
            });

            updateChat(doc.data().conductorID.reference, rideID);
            updateChat(doc.data().pasajeroID.reference, rideID);
        }
    } catch (error) {
        console.log('Error al actualizar', error);
    }

    ofertas.splice(index, 1);

    for (const oferta of ofertas) {
        const reference = db.collection('ofertas').doc(oferta.oferta.id);
        updateStatus(reference, "descartada")
    }
}

//Enviar el ID del ride al perfil del usuario para poder usar el chat
async function updateChat(referenceUser, rideID) {
    try {
        const doc = await referenceUser.get();
        if (doc.exists) {
            referenceUser.update({
                chat: rideID
            });
        }
    } catch (error) {
        console.log('Error al actualizar', error);
    }
}

//Enviar evaluacion detallada
export async function sendCalifs(rideID, fileName, calif) {
    const referenceRide = db.collection('rides').doc(rideID);
    const ride = await referenceRide.get();
    let referenceUser = "";

    if (fileName === "califDetalles_C") {
        referenceUser = ride.data().conductorID.reference;
    } else {
        referenceUser = ride.data().pasajeroID.reference;
    }

    try {
        const doc = await referenceUser.get();

        if (doc.exists) {

            const evaluacion = () => {
                if (doc.data()[fileName] !== undefined) {
                    if (fileName === "califDetalles_C") {
                        return {
                            confiable: doc.data().califDetalles_C.confiable + calif.confiable,
                            manejo: doc.data().califDetalles_C.manejo + calif.manejo,
                            cool: doc.data().califDetalles_C.cool + calif.cool,
                            puntualidad: doc.data().califDetalles_C.puntualidad + calif.puntualidad,
                            vehiculo: doc.data().califDetalles_C.vehiculo + calif.vehiculo,
                            numReviews: doc.data().califDetalles_C.numReviews + 1
                        }
                    } else {
                        return {
                            confiable: doc.data().califDetalles_P.confiable + calif.confiable,
                            cooperacion: doc.data().califDetalles_P.cooperacion + calif.manejo,
                            cool: doc.data().califDetalles_P.cool + calif.cool,
                            puntualidad: doc.data().califDetalles_P.puntualidad + calif.puntualidad,
                            conversacion: doc.data().califDetalles_P.conversacion + calif.vehiculo,
                            numReviews: doc.data().califDetalles_P.numReviews + 1
                        }
                    }
                } else {
                    return {
                        ...calif,
                        numReviews: 1
                    }
                }
            }

            referenceUser.update({
                [fileName]: evaluacion()
            })
        }
    } catch (error) {
        console.log('Error al actualizar', error);
    }

    try {
        if (ride.exists) {
            referenceRide.update({
                [fileName]: true
            });
        }
    } catch (error) {
        console.log('Error al actualizar', error);

    }
}

//Actualizar el estado de una oferta o ride
export async function updateStatus(reference, status) {
    try {
        const doc = await reference.get();
        if (doc.exists) {
            reference.update({
                estado: status
            });
        }
    } catch (error) {
        console.log('Error al actualizar', error);
    }
}

//Enviar informacion de porque se cancelo el ride
export async function sendCancelation(rideID, cause) {
    const reference = db.collection('rides').doc(rideID);

    try {
        const doc = await reference.get();
        if (doc.exists) {
            reference.update({
                motivoCancelacion: cause
            });
        }
    } catch (error) {
        console.log('Error al actualizar', error);
    }
}