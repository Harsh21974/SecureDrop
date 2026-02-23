import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import React from "react";

export default function Layout() {
        return (
                <>
                        <Header />
                        <main className="pt-24 min-h-screen">
                                <Outlet />
                        </main>
                        <Footer />
                </>
        );
}