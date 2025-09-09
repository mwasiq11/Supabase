import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import React from "react";
import ProtectedRoutes from "./form/ProtectedRoutes.jsx";
import { createBrowserRouter, Route } from "react-router-dom";
import { RouterProvider, createRoutesFromElements } from "react-router-dom";
import AuthForm from "./form/AuthForm.jsx";
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<AuthForm />} />
      <Route
        path="/app"
        element={
          <ProtectedRoutes>
            <App />
          </ProtectedRoutes>
        }
      />
    </>
  )
);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
