<<<<<<< HEAD
import { AuthProvider } from './store/authContext'
import ReactDOM from 'react-dom';
=======
>>>>>>> 8ba1151499047d063aad89cc69c8e1a0ad7dcaf9
import { StrictMode } from 'react'
import './lib/i18n'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

<<<<<<< HEAD
ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
)

=======
>>>>>>> 8ba1151499047d063aad89cc69c8e1a0ad7dcaf9
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
<<<<<<< HEAD

=======
>>>>>>> 8ba1151499047d063aad89cc69c8e1a0ad7dcaf9
