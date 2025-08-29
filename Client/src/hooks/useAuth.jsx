import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../lib/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      // console.log("Auth initialization - Token:", !!token, "User data:", !!userData);

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          // console.log("Parsed user:", parsedUser);
          setUser(parsedUser);

          // Validate token by making a request to ensure it's still valid
          try {
            const response = await authAPI.getProfile();
            // console.log("Profile validation successful:", response.data);
            setUser(response.data.user || parsedUser);
          } catch (profileError) {
            // console.error("Profile validation failed:", profileError);
            // If profile request fails, the token might be invalid
            if (profileError.response?.status === 401) {
              throw new Error("Token validation failed");
            }
            // If it's just a network error, keep the user logged in
            setUser(parsedUser);
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          // Token is invalid, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      // console.log("Attempting login with:", credentials.email);
      const response = await authAPI.login(credentials);
      console.log("Login response:", response.data);

      const { user: userData, token } = response.data;

      if (!token) {
        console.error("No token received from server");
        throw new Error("No authentication token received");
      }

      if (!userData) {
        console.error("No user data received from server");
        throw new Error("No user data received");
      }

      // Store both token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      console.log("Login successful, user set:", userData);
      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.msg || error.message || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      await authAPI.register(userData);
      toast.success(
        "Registration successful! Please check your email to verify your account."
      );
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.msg || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      toast.success("Logged out successfully");
    }
  };

  const verifyEmail = async (data) => {
    try {
      await authAPI.verifyEmail(data);
      toast.success("Email verified successfully! You can now login.");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.msg || "Email verification failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resendVerificationEmail = async (email) => {
    try {
      await authAPI.resendVerificationEmail({ email });
      toast.success("Verification email sent! Please check your inbox.");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.msg || "Failed to send verification email";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    verifyEmail,
    resendVerificationEmail,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
