import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { PlantProvider } from "./context/PlantContext.jsx";

import LandingLogin from "./pages/LandingLogin.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PlantRegistration from "./pages/PlantRegistration.jsx";
import PlantProfile from "./pages/PlantProfile.jsx";
import GenomicUpload from "./pages/GenomicUpload.jsx";
import GenomicAnalysis from "./pages/GenomicAnalysis.jsx";
import DiseaseRisk from "./pages/DiseaseRisk.jsx";
import EnvironmentalMonitoring from "./pages/EnvironmentalMonitoring.jsx";
import Explainability from "./pages/Explainability.jsx";
import PlantHealthReport from "./pages/PlantHealthReport.jsx";

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingLogin />} />

      <Route
        path="/*"
        element={
          <RequireAuth>
            <PlantProvider>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="plants/register" element={<PlantRegistration />} />
                <Route path="plants/:plantId/profile" element={<PlantProfile />} />
                <Route path="plants/upload" element={<GenomicUpload />} />
                <Route path="plants/analysis" element={<GenomicAnalysis />} />
                <Route path="plants/risk" element={<DiseaseRisk />} />
                <Route path="plants/environment" element={<EnvironmentalMonitoring />} />
                <Route path="plants/explainability" element={<Explainability />} />
                <Route path="plants/report" element={<PlantHealthReport />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </PlantProvider>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
