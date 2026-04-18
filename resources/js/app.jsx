import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../src/contexts/AuthContext";
import Encrypt from "./pages/Encrypt";
import Decrypt from "./pages/Decrypt";
import Pricing from "./pages/Pricing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Security from "./pages/Security";  // ✅ ADD THIS IMPORT
import Layout from "../views/components/Layout";
import ProtectedRoute from './components/ProtectedRoute';
import WorkspaceDashboard from "./pages/workspace/WorkspaceDashboard";
import AcceptInvite from "./pages/workspace/AcceptInvite";
import SendMessage from "./pages/workspace/SendMessage";
import WorkspaceMessages from "./pages/workspace/WorkspaceMessages";

// Admin imports
import AdminRoute from './components/AdminRoute';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import Users from './admin/User';
import SecureItems from './admin/SecureItems';
import Settings from './admin/Settings';


function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* User-facing routes with main layout */}
                    <Route element={<Layout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/encrypt" element={<Encrypt />} />
                        <Route path="/decrypt/:id" element={<Decrypt />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/accept-invite/:token" element={<AcceptInvite />} />
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        } />
                        <Route path="/security" element={
                            <ProtectedRoute>
                                <Security />
                            </ProtectedRoute>
                        } />  {/* ✅ ADD SECURITY ROUTE */}
                        <Route path="/workspaces" element={
                            <ProtectedRoute>
                                <WorkspaceDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/workspaces/:workspaceId/send" element={
                            <ProtectedRoute>
                                <SendMessage />
                            </ProtectedRoute>
                        } />
                        <Route path="/workspaces/:workspaceId/messages" element={
                            <ProtectedRoute>
                                <WorkspaceMessages />
                            </ProtectedRoute>
                        } />
                    </Route>

                    {/* Admin routes with separate layout and guard */}
                    <Route path="/admin" element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="users" element={<Users />} />
                        <Route path="secure-items" element={<SecureItems />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/encrypt" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);