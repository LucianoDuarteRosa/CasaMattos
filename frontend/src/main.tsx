import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/globals.css';
import { SnackbarProvider as CustomSnackbarProvider } from './components/SnackbarProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <CustomSnackbarProvider>
        <App />
    </CustomSnackbarProvider>
);
