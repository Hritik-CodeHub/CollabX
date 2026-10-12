
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Authentication from './pages/Authentication';
import { Toaster } from "react-hot-toast";
import { AuthProvider } from './context/AuthContext';
import VideoMeet from './pages/VideoMeet';
import Home from './pages/Home';
import History from './pages/History';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
      <Router>
        <AuthProvider>
          <Routes>

            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Authentication />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<Home />} />
              <Route path="/:url" element={<VideoMeet />} />
              <Route path="/history" element={<History />} />
            </Route>

          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
