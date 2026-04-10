import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import GlobalThreats from "./pages/GlobalThreats";
import ProtectionCoverage from "./pages/ProtectionCoverage";
import BlackMarket from "./pages/BlackMarket";
import DomainExposure from "./pages/DomainExposure";
import IdentityExposure from "./pages/IdentityExposure";
import ExecutiveProtection from "./pages/ExecutiveProtection";
import FinancialIntelligence from "./pages/FinancialIntelligence";
import DarkWebSearch from "./pages/DarkWebSearch";
import IAIntelligence from "./pages/IAIntelligence";
import TacticalIntel from "./pages/TacticalIntel";
import DarkWebNews from "./pages/DarkWebNews";
import RansomwareNews from "./pages/RansomwareNews";
import Incidents from "./pages/Incidents";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <ThemeProvider>
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="global-threats" element={<GlobalThreats />} />
            <Route path="protection-coverage" element={<ProtectionCoverage />} />
            <Route path="black-market" element={<BlackMarket />} />
            <Route path="domain-exposure" element={<DomainExposure />} />
            <Route path="identity-exposure" element={<IdentityExposure />} />
            <Route path="executive-protection" element={<ExecutiveProtection />} />
            <Route path="financial-intelligence" element={<FinancialIntelligence />} />
            <Route path="dark-web-search" element={<DarkWebSearch />} />
            <Route path="ia-intelligence" element={<IAIntelligence />} />
            <Route path="tactical-intel" element={<TacticalIntel />} />
            <Route path="dark-web-news" element={<DarkWebNews />} />
            <Route path="ransomware-news" element={<RansomwareNews />} />
            <Route path="incidents" element={<Incidents />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
    </ThemeProvider>
  );
}
