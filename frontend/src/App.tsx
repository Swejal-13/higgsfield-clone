import { Routes, Route } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Landing from "@/pages/Landing";
import Explore from "@/pages/Explore";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import Pricing from "@/pages/Pricing";
import { Privacy, Terms } from "@/pages/Legal";
import Share from "@/pages/Share";
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";

import Dashboard from "@/pages/Dashboard";
import ImageStudio from "@/pages/ImageStudio";
import ImageEdit from "@/pages/ImageEdit";
import VideoStudio from "@/pages/VideoStudio";
import VideoEdit from "@/pages/VideoEdit";
import VideoMotion from "@/pages/VideoMotion";
import AudioStudio from "@/pages/AudioStudio";
import Mcp from "@/pages/Mcp";
import ApiDocs from "@/pages/ApiDocs";
import ChatGptPlugin from "@/pages/ChatGptPlugin";
import Genjutsu from "@/pages/Genjutsu";
import Effects from "@/pages/Effects";
import Cinema from "@/pages/Cinema";
import Marketing from "@/pages/Marketing";
import Contests from "@/pages/Contests";
import Canvas from "@/pages/Canvas";
import Assets from "@/pages/Assets";
import HistoryPage from "@/pages/History";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";

export default function App() {
  return (
    <Routes>
      {/* Public marketing shell */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/share/:id" element={<Share />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Public-accessible creative surfaces (usable signed-out; generating requires login) */}
        <Route path="/image" element={<ImageStudio />} />
        <Route path="/image/edit" element={<ImageEdit />} />
        <Route path="/video" element={<VideoStudio />} />
        <Route path="/video/edit" element={<VideoEdit />} />
        <Route path="/video/motion" element={<VideoMotion />} />
        <Route path="/audio" element={<AudioStudio />} />
        <Route path="/effects" element={<Effects />} />
        <Route path="/genjutsu" element={<Genjutsu />} />
        <Route path="/cinema" element={<Cinema />} />
        <Route path="/mcp" element={<Mcp />} />
        <Route path="/api-docs" element={<ApiDocs />} />
        <Route path="/chatgpt-plugin" element={<ChatGptPlugin />} />
        <Route path="/marketing" element={<Marketing />} />
        <Route path="/contests" element={<Contests />} />
      </Route>

      {/* Authenticated workspace */}
      <Route element={<AppLayout />}>
        <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/canvas" element={<ProtectedRoute><Canvas /></ProtectedRoute>} />
        <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<MainLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
