import { db, firebase } from "../../../config-firebase";
import { sendNotificationByReference, sendNotificationByEmail } from "../../../hooks/Notifications";

//Enviar calificacion general al ride y al perfil
export async function updateRating({ comentario = "", puntaje = 3, id = "", fileName, userReference }) {
    //Agregamos la calificacion y comentario al ride
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

    //Agregamos la calificacion y sumar un ride al perfil del usuario calificado
    try {
        const doc = await userReference.get();
        if (doc.exists) {
            let numRides;
            let total;
            let califFileName;
            let numRidesFileName;

            if (fileName === "califP_C") {
                numRides = doc.data().numRidesConductor + 1;
                total = doc.data().califConductor.total + puntaje;
                califFileName = "califConductor";
                numRidesFileName = "numRidesConductor";
            } else {
                numRides = doc.data().numRidesPasajero + 1;
                total = doc.data().califPasajero.total + puntaje;
                califFileName = "califPasajero";
                numRidesFileName = "numRidesPasajero";
            }

            let promedio = total / numRides;

            userReference.update({
                [califFileName]: { total: total, promedio: promedio },
                [numRidesFileName]: numRides
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

    sendNotificationByReference(
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
export async function updateChat(referenceUser, rideID) {
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

//Cambio de rol
export async function updateRole(email, rol) {
    var user = db.collection('users').doc(email);
    const roleConstant = rol === "Conductor" ? "Pasajero" : "Conductor";

    try {
        const docSnapshot = await user.get();

        if (docSnapshot.exists) {
            user.update({
                role: roleConstant
            });
        }
    } catch (error) {
        console.log('Error al actualizar', error);
    }
}

//Enviar notificacion de nuevo a ride a los usuarios que se encuentran en el rol de conductor 
export async function getDriverUsers() {
    //console.log('Realizando consulta')
    const usersSnapshot = await db.collection('users').where('role', '==', 'Conductor').get();
    const users = [];

    for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        //users.push(userData.email);
        sendNotificationByEmail(
            userData.email,
            'Nuevo Ride Solicitado',
            'Realiza tu oferta',
            'RidesMap'
        );
    }
}

//Elimar el campo de chat del perfil
export async function deleteField(reference) {
    try {
        const doc = await reference.get();
        if (doc.exists) {
            reference.update({
                chat: firebase.firestore.FieldValue.delete()
            });
        }
    } catch (error) {
        console.log('Error al actualizar', error);
    }
}

//Enviar mensaje en el chat y notificacion
export async function sendMessage(message, rideID, userID, rol) {
    const docRef = db.collection('rides').doc(rideID);
    let userReference;

    try {
        const doc = await docRef.get();
        if (doc.exists) {
            if (rol === "Pasajero") {
                userReference = doc.data().conductorID.reference;
            } else {
                userReference = doc.data().pasajeroID.reference;
            }
        }
    } catch (error) {
        console.log('Error al obtener los datos', error);
    }

    sendNotificationByReference(
        userReference,
        'Tienes un nuevo mensaje',
        'Entra a la app y revisa tus chats',
        'ChatScreen'
    );

    return await docRef.collection('messages').doc().set({
        date: new Date(),
        text: message,
        userID: userID
    })
}