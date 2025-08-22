import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from "./component/Navbar.jsx";
import { AuthProvider } from './contexts/AuthContexts.jsx';
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";

function App() {

  return (
    <AuthProvider>
    <Router>

      <Navbar/>
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
    </AuthProvider>
  )
}

export default App
