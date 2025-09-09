import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabase/supabaseClient";

export default function ProtectedRoutes({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [laoding, setLoading] = useState(true);
  useEffect(() => {
    // Check the current session on mount
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.log("Error fetching session:", error.message);
      }
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();
    // Listen for changes (login, logout, refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    // cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);
  // While checking session, don’t render anything
  if (laoding) {
    <div>loading</div>;
  }
  // If no user → redirect
  if (!user) {
    navigate("/app");
    return null;
  }
  // Otherwise render children
  return children;
}
