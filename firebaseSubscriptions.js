import { db } from './config-firebase';

export const subscribeToOfertas = (customCallback) => {
  return db.collection('ofertas').onSnapshot((snapshot) => {
    customCallback(snapshot);
  })
}

export const subscribeToRides = (customCallback) => {
  return db.collection('rides').onSnapshot((snapshot) => {
    customCallback(snapshot);
  })
}

export const subscribeToUsers = (customCallback) => {
  return db.collection('users').onSnapshot((snapshot) => {
    customCallback(snapshot);
  })
}

/* export const subscribeToOfertasAdd = (customCallback) => {
  return db.collection('ofertas').onSnapshot((querySnapshot) => {
    querySnapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const nuevoDocumento = change.doc;
        const data = nuevoDocumento.data();
        customCallback(data);
      }
    })
  })
} */

export const subscribeToOfertasAdd = (customCallback) => {
  let isFirstRun = true; 
  const unsubscribe = db.collection('ofertas').onSnapshot((querySnapshot) => {
    querySnapshot.docChanges().forEach((change) => {
      if (change.type === 'added' && !isFirstRun) {
        const nuevoDocumento = change.doc;
        const data = nuevoDocumento.data();
        customCallback(data);
      }
    })

    isFirstRun = false;
  })

  return () => {
    unsubscribe();
  };
}






