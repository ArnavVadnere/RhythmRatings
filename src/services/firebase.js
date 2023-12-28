// Import the functions you need from the SDKs you need
import * as firebase from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import "firebase/auth";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBtaYdzFMl2bKQK5wpD6o2Q98QDLQ8IZxM",
  authDomain: "spotifyapp-22d72.firebaseapp.com",
  projectId: "spotifyapp-22d72",
  storageBucket: "spotifyapp-22d72.appspot.com",
  messagingSenderId: "654060683115",
  appId: "1:654060683115:web:ad2560d26bc3e15f30162e",
  measurementId: "G-JZ6SE8LKET",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
