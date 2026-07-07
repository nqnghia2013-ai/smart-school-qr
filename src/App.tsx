/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import SubjectRooms from './pages/SubjectRooms';
import RoomDetail from './pages/RoomDetail';
import DigitalClass from './pages/DigitalClass';
import ClassList from './pages/ClassList';
import StudentProfile from './pages/StudentProfile';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Guide from './pages/Guide';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import WorkLog from './pages/WorkLog';
import Feedback from './pages/Feedback';
import DocumentLibrary from './pages/DocumentLibrary';
import SocialNetwork from './pages/SocialNetwork';
import QAChannel from './pages/QAChannel';
import Workspace from './pages/Workspace';
import LearningApps from './pages/LearningApps';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="workspace" element={<Workspace />} />
            <Route path="phong-bo-mon" element={<SubjectRooms />} />
            <Route path="phong-bo-mon/:id" element={<RoomDetail />} />
            <Route path="lop-hoc-so" element={<ClassList />} />
            <Route path="lop-hoc-so/:id" element={<DigitalClass />} />
            <Route path="ho-so-hoc-sinh" element={<StudentProfile />} />
            <Route path="ho-so-hoc-sinh/:id" element={<StudentProfile />} />
            <Route path="thu-vien" element={<DocumentLibrary />} />
            <Route path="ket-noi" element={<SocialNetwork />} />
            <Route path="hoi-dap" element={<QAChannel />} />
            <Route path="app-hoc-tap" element={<LearningApps />} />
            <Route path="quan-ly" element={<Admin />} />
            <Route path="huong-dan" element={<Guide />} />
            <Route path="nhat-ky" element={<WorkLog />} />
            <Route path="gop-y" element={<Feedback />} />
            <Route path="cau-hoi-thuong-gap" element={<FAQ />} />
            <Route path="chinh-sach-bao-mat" element={<PrivacyPolicy />} />
            <Route path="dieu-khoan-dich-vu" element={<TermsOfService />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
