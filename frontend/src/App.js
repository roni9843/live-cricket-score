import React from 'react'
import { io } from 'socket.io-client';
import Layout from './Layout';



//const socket = io("http://localhost:5000"); // Connect to backend
const socket = io("https://06nfzk6p-5000.asse.devtunnels.ms"); // Connect to backend




export default function App() {
  return (
    <div>
    
    <Layout socket={socket}  />

    </div>
  )
}
