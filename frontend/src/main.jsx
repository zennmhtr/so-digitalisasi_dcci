import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Swal from 'sweetalert2'

window.alert = (message) => {
  Swal.fire({
    text: message,
    icon: 'info',
    confirmButtonColor: '#3085d6'
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
