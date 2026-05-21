import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import { ThemeProvider } from "./context/ThemeContext";
import PasswordGate from "./components/PasswordGate";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import GlobalThreats from "./pages/GlobalThreats";
import ProtectionCoverage from "./pages/ProtectionCoverage";
import BlackMarket from "./pages/BlackMarket";
import DomainExposure from "./pages/DomainExposure";
import PII from "./pages/PII";
import ExecutiveProtection from "./pages/ExecutiveProtection";
import FinancialIntelligence from "./pages/FinancialIntelligence";
import DarkWebSearch from "./pages/DarkWebSearch";
import IABMonitor from "./pages/IABMonitor";
import DarkWebNews from "./pages/DarkWebNews";
import Incidents from "./pages/Incidents";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import CustomerLeaks from "./pages/CustomerLeaks";
import ThirdParty from "./pages/ThirdParty";
import Telegram from "./pages/Telegram";
import FraudIntelligence from "./pages/FraudIntelligence";
import InsiderThreat from "./pages/InsiderThreat";
import RFI from "./pages/RFI";
import Coverage from "./pages/Coverage";
import BreachIndex from "./pages/BreachIndex";

export default function App() {
  return (
    <ThemeProvider>
    <PasswordGate>
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="global-threats" element={<GlobalThreats />} />
            <Route path="protection-coverage" element={<ProtectionCoverage />} />
            <Route path="data-on-sale" element={<BlackMarket />} />
            <Route path="black-market" element={<BlackMarket />} />{/* legacy alias */}
            <Route path="domain-exposure" element={<DomainExposure />} />
            <Route path="pii-stealer-exposure" element={<PII />} />
            <Route path="vip-monitoring" element={<ExecutiveProtection />} />
            <Route path="financial-intelligence" element={<FinancialIntelligence />} />
            <Route path="dark-web-search" element={<DarkWebSearch />} />
            <Route path="iab-monitor" element={<IABMonitor />} />
            <Route path="ransom-dark-web-news" element={<DarkWebNews />} />
            <Route path="incidents" element={<Incidents />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="customer-leaks" element={<CustomerLeaks />} />
            <Route path="third-party" element={<ThirdParty />} />
            <Route path="telegram" element={<Telegram />} />
            <Route path="fraud-intelligence" element={<FraudIntelligence />} />
            <Route path="insider-threat" element={<InsiderThreat />} />
            <Route path="rfi" element={<RFI />} />
            <Route path="coverage" element={<Coverage />} />
            <Route path="breach-index" element={<BreachIndex />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
    </PasswordGate>
    </ThemeProvider>
  );
}
