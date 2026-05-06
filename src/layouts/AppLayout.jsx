import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import AdminPanel from "../components/AdminPanel";
import CommentsPanel from "../components/CommentsPanel";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";

export default function AppLayout() {
  const { state } = useData();
  const { t } = useTheme();

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      background: t.bgBase, color: t.text,
      fontFamily: "'Inter', sans-serif",
      transition: "background 0.3s, color 0.3s",
    }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto", position: "relative" }}>
        <TopBar />
        <Outlet />
      </main>
      {state.adminOpen && <AdminPanel />}
      {state.commentsOpen && <CommentsPanel />}
    </div>
  );
}
