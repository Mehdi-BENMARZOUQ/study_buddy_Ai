import {getApps, initializeApp,cert} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from "firebase-admin/firestore"

const initFirebaseAmin = () => {
    const apps = getApps();

    //ensure that only one instance of firebase admin is initialized
    if (!apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!projectId || !clientEmail || !privateKey) {
            throw new Error('Firebase Admin initialization error: Missing environment variables.');
        }

        initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    }

    return {
        auth:getAuth(),
        db:getFirestore(),
    }
}

export const {auth,db} = initFirebaseAmin();