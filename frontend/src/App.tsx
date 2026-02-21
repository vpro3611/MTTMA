import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { routes } from './config/routes';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Organizations } from './pages/Organizations';
import { Organization } from './pages/Organization';
import { Invitations } from './pages/Invitations';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={routes.home} element={<Home />} />
          <Route path={routes.login} element={<Login />} />
          <Route path={routes.register} element={<Register />} />
          <Route
            path={routes.dashboard}
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path={routes.profile(':userId')} element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path={routes.organizations} element={<ProtectedRoute><Organizations /></ProtectedRoute>} />
          <Route path={`${routes.organizations}/:orgId`} element={<ProtectedRoute><Organization /></ProtectedRoute>} />
          <Route path={routes.invitations} element={<ProtectedRoute><Invitations /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={routes.home} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
