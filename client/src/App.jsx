import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import MyBox from './pages/MyBox';
import QuestionBox from './pages/QuestionBox';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my" element={<MyBox />} />
        <Route path="/:username" element={<QuestionBox />} />
      </Routes>
    </BrowserRouter>
  );
}
