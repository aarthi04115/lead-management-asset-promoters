import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminFollowUp from './pages/AdminFollowUp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/followups" replace />} />
        <Route path="/admin/followups" element={<AdminFollowUp />} />
      </Routes>
    </Router>
  );
}

export default App;