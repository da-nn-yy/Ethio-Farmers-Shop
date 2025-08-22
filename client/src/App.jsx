import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react'
import Navbar from "./component/Navbar.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>

      <Navbar/>
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
      </Routes>
    </Router>

  )
}

export default App
