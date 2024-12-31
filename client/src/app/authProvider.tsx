import React, { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { useCreateUserMutation } from "@/state/api"; // Import the mutation from your Redux slice

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3geXbOjQ02rx6fBj7fijJ-KVCN-Cdyb4",
  authDomain: "syncflow-4deef.firebaseapp.com",
  projectId: "syncflow-4deef",
  storageBucket: "syncflow-4deef.firebasestorage.app",
  messagingSenderId: "807912236448",
  appId: "1:807912236448:web:47a57129875f2ce11f70c5",
  measurementId: "G-RHK69BHX1M",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Create an Auth Context
const AuthContext = createContext<any>(null);

// Firebase Auth Provider
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [createUser] = useCreateUserMutation(); // Mutation to create a user in the backend

  // Handle user state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        // Get the necessary user data from Firebase
        const { uid, email } = firebaseUser;
      }
    });

    return () => unsubscribe();
  }, [createUser]);

  // Sign-up function
  const signUp = async (username: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;
      // for postgresql -> stores username and teamId
      await createUser({
        cognitoId: uid,
        username: username || "", // Set username to email prefix
        email: email || "",
        profilePictureUrl: "default.jpg", // Optional
      });
    } catch (error) {
      console.error("Sign-up error:", error);
    }
  };

  // Sign-in function
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        alert("Incorrect password. Please try again.");
      } else if (error.code === "auth/user-not-found") {
        alert("No account found with this email. Please sign up.");
      } else {
        alert("Sign-in error: " + error.message);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn }}>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg font-semibold">Loading...</div>
        </div>
      ) : user ? (
        <div>{children}</div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="max-w-md w-full p-6 bg-white shadow-lg rounded-md">
            <h1 className="text-2xl font-bold text-center mb-4">Welcome</h1>
            <p className="text-center text-gray-600 mb-6">
              Please sign in or sign up to continue.
            </p>
            <AuthForm />
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
const useAuth = () => useContext(AuthContext);

// Auth Form
const AuthForm = () => {
  const { signUp, signIn } = useAuth();
  const [form, setForm] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "", 
    username: "" 
  });
  const [isSignUp, setIsSignUp] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      if (form.password !== form.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      signUp(form.username, form.email, form.password, form.username);
    } else {
      signIn(form.email, form.password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSignUp && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
          />
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          placeholder="Enter your email address"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
        />
      </div>
      {isSignUp && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
          />
        </div>
      )}
      <button
        type="submit"
        className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition"
      >
        {isSignUp ? "Sign Up" : "Sign In"}
      </button>
      <button
        type="button"
        onClick={() => setIsSignUp(!isSignUp)}
        className="w-full py-2 px-4 mt-2 border border-indigo-600 text-indigo-600 font-semibold rounded-md hover:bg-indigo-100 transition"
      >
        {isSignUp ? "Switch to Sign In" : "Switch to Sign Up"}
      </button>
    </form>
  );
};


export default AuthProvider;
