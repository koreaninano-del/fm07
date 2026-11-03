// ===== Firebase 설정 =====
// Firebase 콘솔 > 프로젝트 설정 > 내 앱(웹) > SDK 설정 및 구성 에서 복사해 아래에 붙여 넣으세요.
// 비워 두면 "이 기기에만 저장" 로컬 모드로 동작합니다.
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACy1gs4tcfycG-Y-Km7XjrUUCFGdjYcjk",
  authDomain: "panini-c33ef.firebaseapp.com",
  projectId: "panini-c33ef",
  storageBucket: "panini-c33ef.firebasestorage.app",
  messagingSenderId: "1039718092905",
  appId: "1:1039718092905:web:0e2ae6ee1ccd2bfdd292f8",
  measurementId: "G-6ZYDG9BYME"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);