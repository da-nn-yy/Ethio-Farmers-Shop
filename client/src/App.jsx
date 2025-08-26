import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from "./component/Navbar.jsx";
import { AuthProvider } from './contexts/AuthContexts.jsx';
import Home from "./pages/Home.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import MarketTrends from "./pages/MarketTrends.jsx";
import BuyerDashboard from "./pages/BuyerDashboard.jsx";
import FarmerDashboard from "./pages/FarmerDashboard.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";

function App() {

  return (
    <AuthProvider>
    <Router>

      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/trends" element={<MarketTrends />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
    </AuthProvider>
  )
}

export default App
