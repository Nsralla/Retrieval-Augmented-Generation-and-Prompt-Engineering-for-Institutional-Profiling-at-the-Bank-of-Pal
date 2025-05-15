import './App.css'
import { Chat } from './pages/chat/chat'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext'
import  Home  from './pages/home/home'
import Login from './pages/login/login';
import Signup from './pages/signup/signup';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="w-full h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          <Routes>
            <Route path="/chat" element={<Chat />} />
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/>
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App;