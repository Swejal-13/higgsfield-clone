import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { Workspace } from "@/layouts/Workspace";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import Pricing from "@/pages/Pricing";
import { Privacy, Terms } from "@/pages/Legal";
import Share from "@/pages/Share";
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";

import Dashboard from "@/pages/Dashboard";
import CreationHub from "@/pages/CreationHub";
import Library from "@/pages/Library";
import ImageStudio from "@/pages/ImageStudio";
import ImageEdit from "@/pages/ImageEdit";
import VideoStudio from "@/pages/VideoStudio";
import VideoEdit from "@/pages/VideoEdit";
import VideoMotion from "@/pages/VideoMotion";
import AudioStudio from "@/pages/AudioStudio";
import Genjutsu from "@/pages/Genjutsu";
import Effects from "@/pages/Effects";
import Cinema from "@/pages/Cinema";
import Canvas from "@/pages/Canvas";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Public marketing shell — intentionally small. Explore/MCP/API-docs/
          ChatGPT-plugin/Marketing-studio/Contests were cut: they were static
          pages with no real backend behind them and added navigation weight
          without adding product value. Their source files still exist on
          disk but are no longer routed. */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/share/:id" element={<Share />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* Authenticated workspace: left icon rail + contextual top bar.
          Create is a single entry point; the individual generation
          surfaces (image/video/audio + their edit/motion variants) are
          reached through it rather than through a top-nav mega-menu. */}
      <Route element={<Workspace />}>
        <Route path="/app" element={<Dashboard />} />
        <Route path="/create" element={<CreationHub />} />
        <Route path="/image" element={<ImageStudio />} />
        <Route path="/image/edit" element={<ImageEdit />} />
        <Route path="/video" element={<VideoStudio />} />
        <Route path="/video/edit" element={<VideoEdit />} />
        <Route path="/video/motion" element={<VideoMotion />} />
        <Route path="/audio" element={<AudioStudio />} />
        <Route path="/genjutsu" element={<Genjutsu />} />
        <Route path="/effects" element={<Effects />} />
        <Route path="/cinema" element={<Cinema />} />
        <Route path="/canvas" element={<Canvas />} />

        <Route path="/library" element={<Library />} />
        {/* Back-compat: the old History/Assets pages merged into Library. */}
        <Route path="/history" element={<Navigate to="/library" replace />} />
        <Route path="/assets" element={<Navigate to="/library" replace />} />

        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/settings" element={<Settings />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<MainLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
