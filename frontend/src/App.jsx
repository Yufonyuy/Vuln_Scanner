import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NewScan from './pages/NewScan';
import ScanDetail from './pages/ScanDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<NewScan />} />
        <Route path="/scan/:id" element={<ScanDetail />} />
        <Route path="*" element={<div className="p-8 text-center text-gray-400">Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;