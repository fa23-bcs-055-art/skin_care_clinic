import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function PublicLayout() {
  return (
    <div className="public-layout">
      <Navbar />
      <main style={{ minHeight: "calc(100vh - 80px)", marginTop: "0" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default PublicLayout;