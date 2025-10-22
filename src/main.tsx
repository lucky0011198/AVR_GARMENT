import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from "@clerk/clerk-react";


const clerkPubKey = import.meta.env.VITE_PUBLIC_CLERK_PUBLISHABLE_KEY as string;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <ClerkProvider publishableKey={clerkPubKey}>
      <App />
     </ClerkProvider>
  </StrictMode>,
)
