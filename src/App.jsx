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
import PeoplePage from "./pages/PeoplePage.jsx";
import CreateGroupPage from "./pages/CreateGroupPage.jsx";
import GroupDetailPage from "./pages/GroupDetailPage.jsx";
import GroupManagePage from "./pages/GroupManagePage.jsx";
import ConnectPage from "./pages/ConnectPage.jsx";
import MeetPage from "./pages/MeetPage.jsx";
import CreateActivityPage from "./pages/CreateActivityPage.jsx";
import ActivityDetailPage from "./pages/ActivityDetailPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import MySpacePage from "./pages/MySpacePage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";

function Shell() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <NotificationsProvider>
    <NotificationToast />
    <div className={isLanding ? "" : "app-layout"}>
      {!isLanding && <Navbar />}
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
          <Route path="/people" element={<ProtectedRoute><PeoplePage /></ProtectedRoute>} />
          <Route path="/connect" element={<ProtectedRoute><ConnectPage /></ProtectedRoute>} />
          <Route path="/meet" element={<ProtectedRoute><MeetPage /></ProtectedRoute>} />
          <Route path="/create-activity" element={<ProtectedRoute><CreateActivityPage /></ProtectedRoute>} />
          <Route path="/meet/:activityId" element={<ProtectedRoute><ActivityDetailPage /></ProtectedRoute>} />
          <Route path="/create-group" element={<ProtectedRoute><CreateGroupPage /></ProtectedRoute>} />
          <Route path="/groups/:groupId" element={<ProtectedRoute><GroupDetailPage /></ProtectedRoute>} />
          <Route path="/groups/:groupId/manage" element={<ProtectedRoute><GroupManagePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/my-space" element={<ProtectedRoute><MySpacePage /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
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
