import axios from 'axios';

// reference = referencia al documento del usuario al que se enviara la notificacion
export const sendNotificationByReference = async (reference, title, message, screen) => {
    try {
        const doc = await reference.get();
        if (doc.exists) {
            const id = await doc.data().email;
            axios.post(`https://app.nativenotify.com/api/indie/notification`, {
                subID: id,
                appId: 13000,
                appToken: 'Dke2V9YbViRt26fTH2Mv7q',
                //appId: 14050,
                //appToken: 'teVYjQw7P4lRK3FcQSIuzV',
                title: title,
                message: message,
                icon: '../assets/rideSchoolS.png',
                color: '#2B6451',
                data: {
                    screenToOpen: screen
                }
            })
        } else {
            console.log('Error al enviar notificacón');
        }
    } catch (error) {
        console.error('Error al obtener los documentos:', error);
        throw error;
    }
}

//Enviar notificacion cuando se tiene el email del usuario
export const sendNotificationByEmail = async (email, title, message, screen) => {
    //console.log(email)
    try {
        axios.post(`https://app.nativenotify.com/api/indie/notification`, {
            subID: email,
            appId: 13000,
            appToken: 'Dke2V9YbViRt26fTH2Mv7q',
            //appId: 14050,
            //appToken: 'teVYjQw7P4lRK3FcQSIuzV',
            title: title,
            message: message,
            icon: '../assets/rideSchoolS.png',
            color: '#2B6451',
            data: {
                screenToOpen: screen
            }
        })
    } catch (error) {
        console.error('Error al obtener los documentos:', error);
        throw error;
    }
}

//Enviar notificacion 5min despues del tiempo estimado del ride
export const sendNotificationWithTimer = async (referenceConductor, referencePasajero, min, status, title, message, screen) => {
    const time = (min + 5) * 60000;

    try {
        setTimeout(() => {
            if (status !== "llego al destino") {
                sendNotificationByReference(
                    referenceConductor,
                    title,
                    message,
                    screen
                );

                sendNotificationByReference(
                    referencePasajero,
                    title,
                    message,
                    screen
                );
            }
        }, time);
    } catch (error) {
        console.error('Error al obtener los documentos:', error);
        throw error;
    }
}