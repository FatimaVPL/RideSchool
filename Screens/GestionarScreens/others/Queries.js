import { db, firebase } from "../../../config-firebase";

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
            promedio = promedio.toFixed(1);
            promedio = parseFloat(promedio);

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
export const updateRide = async (ofertas, index, rideID, sendPushNotification) => {
    const oferta = ofertas[index].oferta;
    const tokenConductor = oferta.conductorID?.token;
    const referenceRide = oferta.rideID?.reference;
    const referenceOferta = db.collection('ofertas').doc(oferta.id);

    try {
        sendPushNotification(
            'Oferta Aceptada',
            'Dirígete al punto de encuentro',
            tokenConductor
        )

    } catch (error) {
        console.log('Error al enviar notificacion oferta aceptada', error);
    }

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

            updateChat(doc.data().conductorID?.reference, rideID);
            updateChat(doc.data().pasajeroID?.reference, rideID);
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
export const getDriverUsers = async (sendPushNotification) => {
    const usersSnapshot = await db.collection('users').where('role', '==', 'Conductor').get();

    for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();

        sendPushNotification(
            'Nuevo Ride Solicitado',
            'Realiza tu oferta',
            userData.token
        )
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
export const sendMessage = async (message, rideID, userID, rol, sendPushNotification) => {
    const docRef = db.collection('rides').doc(rideID);
    let userToken;

    try {
        const doc = await docRef.get();
        if (doc.exists) {
            if (rol === "Pasajero") {
                userToken = doc.data().conductorID.token;
            } else {
                userToken = doc.data().pasajeroID.token;
            }
        }
    } catch (error) {
        console.log('Error al obtener los datos', error);
    }

    try {
        sendPushNotification(
            'Tienes un nuevo mensaje',
            'Entra a la app y revisa tus chats',
            userToken
        )

    } catch (error) {
        console.log('Error al enviar notificacion chat', error);
    }

    return await docRef.collection('messages').doc().set({
        date: new Date(),
        text: message,
        userID: userID
    })
}

//Registrar el token en el pefil del usuario
export async function sendToken(expoPushToken, email) {
    var user = db.collection('users').doc(email);

    try {
        const docSnapshot = await user.get();

        if (docSnapshot.exists) {
            user.update({
                token: expoPushToken
            });
        }
    } catch (error) {
        console.log('Error al guardar token', error);
    }
}