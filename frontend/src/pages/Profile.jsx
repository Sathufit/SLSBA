import React, { useEffect, useState } from "react";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      window.location.href = "/login";
    } else {
      setUser(storedUser);
    }
  }, []);

  if (!user) return null;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome, {user.fullName}</h2>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>School:</strong> {user.schoolName}</p>
      <button onClick={() => {
        localStorage.clear();
        window.location.href = "/login";
      }}>Logout</button>
    </div>
  );
};

export default Profile;
