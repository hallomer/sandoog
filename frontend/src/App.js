import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import UserComponent from './components/UserComponent';
import BudgetComponent from './components/BudgetComponent';
import TransactionComponent from './components/TransactionComponent';
import SavingsComponent from './components/SavingsComponent';
import SummaryComponent from './components/SummaryComponent';
import PrivateRoute from './components/PrivateRoute';
import './styles/App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, setUser } = useUser();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSignOut = async () => {
    setUser(null);
  };

  return (
    <Router>
      <div className={`app ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Header toggleSidebar={toggleSidebar} onSignOut={handleSignOut} />
        <div className="content">
          <Sidebar isOpen={sidebarOpen} handleToggle={toggleSidebar} />
          <div className="main-content">
            <Routes>
              <Route path="/user" element={user ? <Navigate to="/" replace /> : <UserComponent />} />
              <Route path="/" element={
                <PrivateRoute>
                  <SummaryComponent />
                </PrivateRoute>
              } />
              <Route path="/transactions" element={
                <PrivateRoute>
                  <TransactionComponent />
                </PrivateRoute>
              } />
              <Route path="/budgets" element={
                <PrivateRoute>
                  <BudgetComponent />
                </PrivateRoute>
              } />
              <Route path="/savings" element={
                <PrivateRoute>
                  <SavingsComponent />
                </PrivateRoute>
              } />
              <Route path="*" element={<Navigate to={user ? "/" : "/user"} replace />} />
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;