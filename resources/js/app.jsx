import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Encrypt from "./pages/Encrypt";
import Decrypt from "./pages/Decrypt";
import Layout from "../views/components/Layout";

function App() {
        return (
                <BrowserRouter>
                        <Routes>

                                {/* Layout wrapper */}
                                <Route element={<Layout />}>
                                        <Route path="/" element={<Navigate to="/encrypt" />} />
                                        <Route path="/encrypt" element={<Encrypt />} />
                                        <Route path="/decrypt/:id" element={<Decrypt />} />
                                </Route>

                                {/* Fallback */}
                                <Route path="*" element={<Navigate to="/encrypt" />} />

                        </Routes>
                </BrowserRouter>
        );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);