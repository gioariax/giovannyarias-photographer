import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'yet-another-react-lightbox/styles.css';
import { Provider } from "@/components/ui/provider"

createRoot(document.getElementById('root')!).render(
  <Provider>
    <App />
  </Provider>
)
