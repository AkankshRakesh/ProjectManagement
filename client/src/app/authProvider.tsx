import React, { createContext, useContext, useState, useEffect } from "react";
import auth from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { useCreateUserMutation } from "@/state/api"; // Import the mutation from your Redux slice
import { uploadProfilePicture } from "./profileUpload";

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
    });

    return () => unsubscribe();
  }, [createUser]);

  // Sign-up function
  const signUp = async (
    username: string,
    email: string,
    password: string,
    profilePicture: File | string,
    useDefault: boolean
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      let profilePictureUrl = useDefault ? "default.jpg" : "default.jpg"; // Default profile picture URL

      // If the user uploaded a profile picture, upload it to Cloudinary
      if (typeof profilePicture !== "string" && !useDefault) {
        profilePictureUrl = await uploadProfilePicture(profilePicture);
      }

      // Save the user to your backend
      await createUser({
        cognitoId: uid,
        username: username || "", // Use email prefix if username is empty
        email: email || "",
        profilePictureUrl, // Cloudinary URL or default
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
    username: "",
    profilePicture: null as File | null
  });
  const [isSignUp, setIsSignUp] = useState(true);
  const [useDefault, setUseDefault] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      if (form.password !== form.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      signUp(form.username, form.email, form.password, form.profilePicture, useDefault);
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
      {isSignUp && !useDefault && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setForm({ ...form, profilePicture: file });
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
          />
        </div>
      )}
      {isSignUp && (
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useDefault}
              onChange={(e) => setUseDefault(e.target.checked)}
              className="h-5 w-5"
            />
            <span className="text-sm text-gray-700">Use default profile picture</span>
          </label>
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
