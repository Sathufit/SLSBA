import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

// User-side pages
import Home from "./pages/Home";
import TournamentPage from "./pages/TournamentPage";
import TournamentReg from "./pages/TournamentReg";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AboutUs from "./pages/AboutUs";
import PaymentPage from "./pages/PaymentPage";
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage";
import NewsDetail from "./components/NewsDetail";
import MediaDetail from "./components/MediaDetail";
import Profile from "./pages/Profile";

// Admin-side pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminTournament from "./pages/AdminTournament";
import AdminPanel from "./pages/AdminPanel";
import FinanceHome from "./pages/financeHome";
import AddOrEditIncome from "./pages/AddOrEditIncome";
import AddOrEditExpense from "./pages/AddOrEditExpense";
import AdminApp from "./pages/AdminApp";
import AdminNewsPanel from "./pages/AdminNewsPanel";

// Shared pages
import Support from "./pages/Support";
import UserApp from "./pages/UserApp";
import NewsFeed from "./pages/NewsFeed";

// Protected route wrapper
import ProtectedRoute from "./ProtectedRoute";

const App = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    setIsAdminLoggedIn(!!token);
  }, []);

  return (
    <Routes>
      {/* Public User Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/tournaments" element={<TournamentPage />} />
      <Route path="/tournamentReg/:tournamentId" element={<TournamentReg />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/cancel" element={<CancelPage />} />
      <Route path="/contact" element={<Support />} />
      <Route path="/training" element={<UserApp />} />
      <Route path="/news" element={<NewsFeed />} />
      <Route path="/news/:id" element={<NewsDetail />} />
      <Route path="/media/:id" element={<MediaDetail />} />
      <Route path="/profile" element={<Profile />} />

      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Pages — NO REDIRECT from /admin */}
      <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      <Route
        path="/admin/tournaments"
        element={
          <ProtectedRoute isAdminLoggedIn={isAdminLoggedIn}>
            <AdminTournament />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/support"
        element={
          <ProtectedRoute isAdminLoggedIn={isAdminLoggedIn}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-training"
        element={
          <ProtectedRoute isAdminLoggedIn={isAdminLoggedIn}>
            <AdminApp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/news"
        element={
          <ProtectedRoute isAdminLoggedIn={isAdminLoggedIn}>
            <AdminNewsPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/finance"
        element={
          <ProtectedRoute isAdminLoggedIn={isAdminLoggedIn}>
            <FinanceHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/finance/add-income"
        element={
          <ProtectedRoute isAdminLoggedIn={isAdminLoggedIn}>
            <AddOrEditIncome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/finance/edit-income/:id"
        element={
          <ProtectedRoute isAdminLoggedIn={isAdminLoggedIn}>
            <AddOrEditIncome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/finance/add-expense"
        element={
          <ProtectedRoute isAdminLoggedIn={isAdminLoggedIn}>
            <AddOrEditExpense />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/finance/edit-expense/:id"
        element={
          <ProtectedRoute isAdminLoggedIn={isAdminLoggedIn}>
            <AddOrEditExpense />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<h2>404 - Page Not Found</h2>} />
    </Routes>
  );
};

export default App;
