import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCh-V1Z4dH2y__gU4anmMwH5kmE9G53Vi8",
  authDomain:"recoverx-58fb7.firebaseapp.com",
  projectId: "recoverx-58fb7",
  storageBucket:"recoverx-58fb7.firebasestorage.app",
  messagingSenderId:"642577815852",
  appId:"1:642577815852:web:d4288ed5bc13e371ed7489",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);