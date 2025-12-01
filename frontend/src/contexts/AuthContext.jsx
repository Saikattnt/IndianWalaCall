import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import httpStatus from "http-status";

export const AuthContext = createContext(null);

const serverUrl = import.meta.env.VITE_SERVER_URL;
let baseURL = "http://localhost:8000/api/v1/users";

if (serverUrl) {
  const origin = serverUrl.startsWith("http") ? serverUrl : `https://${serverUrl}`;
  baseURL = `${origin}/api/v1/users`;
}

const client = axios.create({
  baseURL: baseURL,
});

// attach token automatically (if present)
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // optional: rehydrate user on refresh if your backend has /me
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    (async () => {
      try {
        const res = await client.get("/me"); // adjust if your route differs
        if (res.status === httpStatus.OK && res.data?.user) {
          setUserData(res.data.user);
        }
      } catch {
        // token invalid/expired
        localStorage.removeItem("token");
        setUserData(null);
      }
    })();
  }, []);

  const handleRegister = async ({ name, username, password }) => {
    const res = await client.post("/register", { name, username, password });
    if (res.status === httpStatus.CREATED) {
      if (res.data?.user) setUserData(res.data.user);
      navigate("/login", { replace: true });
    }
    return res.data; // e.g. { message, user, token? }
  };

  const handleLogin = async (username, password) => {
    const res = await client.post("/login", { username, password });
    if (res.status === httpStatus.OK) {
      if (res.data?.token) localStorage.setItem("token", res.data.token);
      if (res.data?.user) setUserData(res.data.user);

      // ⬇️ redirect after successful login
      navigate("/home", { replace: true }); // change path if you want /home or /dashboard
      return { ok: true, ...res.data };
    }
    return { ok: false, ...res.data };
  };

  const getHistoryOfUser = async () => {
    try {
      let request = await client.get("/get_all_activity", {
        params: {
          token: localStorage.getItem("token"),
        },
      });
      return request.data;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    navigate("/"); // or wherever
  };

  const addToUserHistory = async (meetingCode) => {
    try {
      let request = await client.post("/add_to_activity", {
        token: localStorage.getItem("token"),
        meeting_code: meetingCode,
      });
      return request;
    } catch (e) {
      console.error("addToUserHistory error:", e.response?.data || e);
      throw e;
    }
  };

  const value = useMemo(
    () => ({
      userData,
      setUserData,
      addToUserHistory,
      getHistoryOfUser,
      handleRegister,
      handleLogin,
      logout,
      navigate,
      client, // optional: expose configured axios
    }),
    [userData, navigate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
