// src/App.tsx
import './App.css'
import { Chat } from './pages/chat/chat'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext'
import Home from './pages/home/home'
import Login from './pages/login/login';
import Signup from './pages/signup/signup';
import ReviewsSummary from './pages/reviews/reviews_home';
import NotFound from './pages/NotFound';
import BranchReviews from './pages/reviews/BranchReviews';
import BranchRatings from './components/BranchReviews/BranchRatings';
import ReviewsByRating from './pages/reviews/ReviewsByRating';
import Profile from './pages/profile/profile'; // Add this import

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="w-full h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          <Routes>
            {/* now matches /chat/123 */}
            <Route path="/chat/:chatId" element={<Chat />} />
            <Route path="/" element={<Home />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reviews" element={<ReviewsSummary/>}/>
            <Route path="/reviews/:branchName" element={<BranchReviews />} />
            <Route path="/branch-ratings" element={<BranchRatings />} />
            <Route path="/reviews/rating/:star" element={<ReviewsByRating />} />
            <Route path="/profile" element={<Profile />} /> {/* Add this route */}
            <Route path="*" element={<NotFound />} />
            
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App;
