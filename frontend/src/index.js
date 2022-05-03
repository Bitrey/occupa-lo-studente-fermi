import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import "./index.css";
// import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";

import reportWebVitals from "./reportWebVitals";

import store from "./app/store";

import MainBase from "./components/MainBase";
import MainHomepage from "./components/MainHomepage";

import StudentBase from "./components/student/StudentBase";
import StudentHome from "./components/student/StudentHome";
import StudentLogin from "./components/student/StudentLogin";
import StudentSignup from "./components/student/StudentSignup";
import SecretaryBase from "./components/secretary/SecretaryBase";
import SecretaryHomepage from "./components/secretary/SecretaryHomepage";
import AgencyBase from "./components/agency/AgencyBase";
import AgencyHome from "./components/agency/AgencyHome";
import AgencySignup from "./components/agency/AgencySignup";
import AgencyLogin from "./components/agency/AgencyLogin";
import AgencyDashboard from "./components/agency/AgencyDashboard";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="" element={<MainBase />}>
              <Route path="" element={<MainHomepage />} />
              {/* eventually other routes not related to student or agency */}
            </Route>
            <Route path="secretary" element={<SecretaryBase />}>
              <Route path="" element={<SecretaryHomepage />} />
            </Route>
            <Route path="student" element={<StudentBase />}>
              <Route path="" element={<StudentHome />} />
              <Route path="signup" element={<StudentSignup />} />
              <Route path="login" element={<StudentLogin />} />
            </Route>
            <Route path="agency" element={<AgencyBase />}>
              <Route path="" element={<AgencyHome />} />
              <Route path="signup" element={<AgencySignup />} />
              <Route path="login" element={<AgencyLogin />} />
              <Route path="dashboard" element={<AgencyDashboard />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
