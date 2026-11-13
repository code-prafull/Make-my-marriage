import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import WeddingLayout from "../layouts/WeddingLayout";
import LoginPage from "../pages/public/LoginPage";
import SignupPage from "../pages/public/SignupPage";
import RsvpPage from "../pages/public/RsvpPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import CreateWeddingPage from "../pages/weddings/CreateWeddingPage";
import WeddingOverview from "../pages/weddings/WeddingOverview";
import EventsPage from "../pages/weddings/EventsPage";
import TasksPage from "../pages/weddings/TasksPage";
import MembersPage from "../pages/weddings/MembersPage";
import GuestsPage from "../pages/weddings/GuestsPage";
import ProtectedRoute from "./ProtectedRoute";

/**
 * Route categories (per System Design §4.2):
 *  - Public:       /, /login, /signup
 *  - Protected:    /dashboard, /weddings/*
 *  - Token-based:  /invite/:token, /wedding/:token (added in later phases)
 */
const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Navigate to="/login" replace /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/rsvp/:token", element: <RsvpPage /> },
      { path: "/forgot-password", element: <Navigate to="/login" replace /> },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/weddings/new",
    element: (
      <ProtectedRoute>
        <CreateWeddingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/weddings/:weddingId",
    element: (
      <ProtectedRoute>
        <WeddingLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <WeddingOverview /> },
      { path: "events", element: <EventsPage /> },
      { path: "tasks", element: <TasksPage /> },
      { path: "guests", element: <GuestsPage /> },
      { path: "members", element: <MembersPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;
