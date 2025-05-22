import { createBrowserRouter } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import App from "./pages/App";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ConfirmEmail from "./pages/ConfirmEmail";
import Confirmation from "./pages/Confirmation";

export const router = createBrowserRouter([
    {path: "/", element: <App />},
    {path: "/signup", element: <Signup />},
    {path: "/signin", element: <Signin />},
    {path: "/confirm-email", element: <ConfirmEmail />},
    {path: "/confirmation", element: <Confirmation />},
    {
        path: "/student-dashboard", 
        element: (
            <RequireAuth allowedRoles={["student", "admin"]}>
                <StudentDashboard />
            </RequireAuth>
        )
    },
    {
        path: "/admin-dashboard",
        element: (
            <RequireAuth allowedRoles={['admin']}>
                <AdminDashboard />
            </RequireAuth>
        )
    }
]);
