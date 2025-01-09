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
import { toast } from "react-toastify"; // Import Toaster's toast function
import "react-toastify/dist/ReactToastify.css";
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

      let profilePictureUrl = useDefault ? "userDefault.jpg" : "userDefault.jpg"; // Default profile picture URL

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
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already in use. Please sign in.");
      } else {
        toast.error("Sign-in error: " + error.message);
      }
    }
  };

  // Sign-in function
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        toast.error("Incorrect password or email. Please try again.");
      } else if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email. Please sign up.");
      } else {
        toast.error("Sign-in error: " + error.message);
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
    profilePicture: null as File | null,
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    profilePicture: "",
  });
  const [isSignUp, setIsSignUp] = useState(true);
  const [useDefault, setUseDefault] = useState(false);

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "", confirmPassword: "", username: "", profilePicture: "" };
  
    if (!form.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
      valid = false;
    }
  
    if (!form.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }
  
    if (isSignUp) {
      if (!form.username) {
        newErrors.username = "Username is required";
        valid = false;
      }
  
      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
        valid = false;
      }
  
      if (!useDefault && !form.profilePicture) {
        newErrors.profilePicture = "Either upload a picture or select the default option";
        valid = false;
      }
    }
  
    setErrors(newErrors);
    return valid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    try {
      if (isSignUp) {
        await signUp(form.username, form.email, form.password, form.profilePicture, useDefault);
      } else {
        await signIn(form.email, form.password);
      }
    } catch (error: any) {
      // Handle specific error cases
      if (error.code === "auth/invalid-email") {
        setErrors((prev) => ({ ...prev, email: "Invalid email address" }));
      } else if (error.code === "auth/weak-password") {
        setErrors((prev) => ({ ...prev, password: "Weak password. Try a stronger one." }));
      } else if (error.code === 400) {
        setErrors((prev) => ({ ...prev, email: "Email is already in use" }));
      } else if (error.code === "auth/user-not-found") {
        setErrors((prev) => ({ ...prev, email: "No account found with this email." }));
      } else if (error.code === "auth/incorrect-password") {
        setErrors((prev) => ({ ...prev, password: "Incorrect password. Please try again." }));
      } else {
        // Default case for any unknown error
        setErrors((prev) => ({
          ...prev,
          email: `An unexpected error occurred: ${error.message}`,
        }));
      }
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
        />
        {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
      </div>
      )}
      {isSignUp && (
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
    {errors.profilePicture && (
      <p className="text-sm text-red-600">{errors.profilePicture}</p>
    )}
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
      </div>
      <div>
      <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
        />
        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
      </div>
      {isSignUp && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-indigo-300"
          />
          {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
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
