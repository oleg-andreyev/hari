import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import { Header } from "./components/Header";
import { Home } from "./pages/Home";
import { Upload } from "./pages/Upload";
import { NotFound } from "./pages/404";

const Layout = () => {
  return (
    <>
      <Header />
      <main className="p-4 flex-grow-1">
        <Outlet />
      </main>
      <footer className="bg-info text-center">
        <div className="text-center p-3">2023 &copy; HARI team</div>
      </footer>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="upload" element={<Upload />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
