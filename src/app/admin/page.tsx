"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../AppContext";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setIsAdmin } = useAppContext();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (username === "admin" && password === "admin123") {
      setIsAdmin(true);
      router.push("/");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "white",
      padding: "20px",
    }}>
      <div style={{
        background: "white",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "400px",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px",
            height: "56px",
            background: "black",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "24px",
            color: "white",
            fontWeight: "bold",
          }}>
            🔒
          </div>
          <h1 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "black",
            margin: "0 0 8px",
          }}>
            Admin Login
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#6b7280",
            margin: 0,
          }}>
            Sign in to manage your content
          </p>
        </div>

        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            color: "#dc2626",
            fontSize: "14px",
            textAlign: "center",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "black",
              marginBottom: "6px",
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1.5px solid #e5e7eb",
                fontSize: "14px",
                color: "black",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              color: "black",
              marginBottom: "6px",
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1.5px solid #e5e7eb",
                fontSize: "14px",
                color: "black",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "10px",
              border: "1px solid black",
              background: "white",
              color: "black",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </form>

        <p style={{
          textAlign: "center",
          marginTop: "24px",
          fontSize: "12px",
          color: "#9ca3af",
        }}>
          <a href="/" style={{ color: "black", textDecoration: "none" }}>← Back to site</a>
        </p>
      </div>
    </div>
  );
}
