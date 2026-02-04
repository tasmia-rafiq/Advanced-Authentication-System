import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Suspense, lazy } from "react";
import AppLayout from "./layouts/AppLayout";
import AppLoader from "./components/AppLoader";
import Home from "./pages/Home";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Verify = lazy(() => import("./pages/Verify"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const PublicRoute = lazy(() => import("./components/PublicRoute"));

const App = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Suspense fallback={<AppLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* PUBLIC ROUTES */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/register" element={<Register />} />
              <Route path="/token/:token" element={<Verify />} />
            </Route>

            {/* PROTECTED ROUTES */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </Suspense>
      </AppLayout>

      <ToastContainer position="bottom-right" />
    </BrowserRouter>
  );
};

export default App;