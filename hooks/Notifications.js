import axios from 'axios';

// reference = referencia al documento del usuario al que se enviara la notificacion
export const sendNotification = async (reference, title, message, screen) => {
    try {
        const doc = await reference.get();
        if (doc.exists) {
            const id = await doc.data().email;
            axios.post(`https://app.nativenotify.com/api/indie/notification`, {
                subID: id,
                appId: 13000,
                appToken: 'Dke2V9YbViRt26fTH2Mv7q',
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