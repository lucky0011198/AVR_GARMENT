import { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import Loader from "./components/loader";
import { Toaster } from "@/components/ui/sonner";
import Init from "./app/auth/init";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <AuthProvider>
          <Init />
        </AuthProvider>
        <Toaster />
      </Suspense>
    </BrowserRouter>
  );
}
