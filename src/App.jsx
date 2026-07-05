import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationsProvider } from "./context/NotificationsContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import NotificationToast from "./components/NotificationToast.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import SupportGroupsPage from "./pages/SupportGroupsPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ConversationPage from "./pages/ConversationPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import HelpCenterPage from "./pages/HelpCenterPage.jsx";
import ReportIssuePage from "./pages/ReportIssuePage.jsx";
import NewPostPage from "./pages/NewPostPage.jsx";

const NAV_PATHS = ["/home", "/groups", "/chat", "/profile"];

function Shell() {
  const location = useLocation();
  const showNav = NAV_PATHS.includes(location.pathname);

  return (
    <NotificationsProvider>
    <NotificationToast />
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><SupportGroupsPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/chat/:userId" element={<ProtectedRoute><ConversationPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/help-center" element={<ProtectedRoute><HelpCenterPage /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><ReportIssuePage /></ProtectedRoute>} />
        <Route path="/new-post" element={<ProtectedRoute><NewPostPage /></ProtectedRoute>} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
      {showNav && <Navbar />}
    </div>
    </NotificationsProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
