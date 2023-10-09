import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import 'firebase/compat/storage'

const firebaseConfig = {
    apiKey: "AIzaSyCsVrksMacPO9bF_aOowmUHoaKVoTX6Hws",
    authDomain: "rideschool-2f902.firebaseapp.com",
    projectId: "rideschool-2f902",
    storageBucket: "rideschool-2f902.appspot.com",
    messagingSenderId: "1087740486819",
    appId: "1:1087740486819:web:8fa548ec520e335d050b16"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

export { auth, db };
export { firebase };
