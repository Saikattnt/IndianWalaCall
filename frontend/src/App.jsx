import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css"; // <- ensure this import exists
import { Suspense, lazy } from "react";

const LandingPage = lazy(() => import("./pages/Landing.jsx"));
const Authentication = lazy(() => import("./pages/AuthLayout.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const VideoMeetComponent = lazy(() => import("./pages/VideoMeet.jsx"));
const HomeComponent = lazy(() => import("./pages/home.jsx"));
const History = lazy(() => import("./pages/history.jsx"));

///:url are called slugs
function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Authentication />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/:url" element={<VideoMeetComponent />} />
            <Route path="/home" element={<HomeComponent />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}
export default App;
