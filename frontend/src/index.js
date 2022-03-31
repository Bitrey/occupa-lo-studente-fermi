import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import "./index.css";
// import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";

import reportWebVitals from "./reportWebVitals";

import MainBase from "./components/MainBase";
import MainHomepage from "./components/MainHomepage";

import StudentBase from "./components/student/StudentBase";
import StudentHome from "./components/student/StudentHome";
import StudentLogin from "./components/student/StudentLogin";
import StudentSignup from "./components/student/StudentSignup";
import StudentJobOffers from "./components/student/StudentJobOffers";
import store from "./app/store";

const selectStudent = state => state.student;

function RequireStudentAuth({ children }) {
  const { student } = useSelector(selectStudent);
  const location = useLocation();

  if (!student) {
    // Send to login
    return <Navigate to="/student/login" state={{ from: location }} replace />;
  }

  return children;
}

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
            <Route path="student" element={<StudentBase />}>
              <Route path="" element={<StudentHome />} />
              <Route
                path="joboffers"
                element={
                  <RequireStudentAuth>
                    <StudentJobOffers />
                  </RequireStudentAuth>
                }
              />
              <Route path="signup" element={<StudentSignup />} />
              <Route path="login" element={<StudentLogin />} />
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
