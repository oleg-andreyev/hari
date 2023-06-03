import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import { Header } from "./components/Header";
import { Positions } from "./pages/Positions";
import { Upload } from "./pages/Upload";
import { NotFound } from "./pages/404";
import { ResumeList } from "./pages/ResumeList";
import { Resume } from "./pages/Resume";

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
        <Route index element={<Positions />} />
        <Route path="upload" element={<Upload />} />
        <Route path="resumes" element={<ResumeList />} />
        <Route path="resumes/:id" element={<Resume />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
