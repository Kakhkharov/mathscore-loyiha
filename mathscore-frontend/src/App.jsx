import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminApp from './admin/App.jsx';
import StudentApp from './student/App.jsx';
import LandingApp from './landing/App.jsx';

import './admin/App.css';
import './student/App.css';
import './landing/App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingApp />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/student/*" element={<StudentApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

