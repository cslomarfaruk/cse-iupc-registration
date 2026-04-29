"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  // Animation initialization
  useEffect(() => {
    setInitialized(true);

    // Create star field background
    const createStars = () => {
      const starContainer = document.getElementById("stars-container");
      if (!starContainer) return;

      starContainer.innerHTML = "";
      const numberOfStars = 150;

      for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement("div");
        star.className = "absolute rounded-full bg-white";

        // Random size
        const size = Math.random() * 2;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        // Random position
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;

        // Random animation delay
        star.style.animationDelay = `${Math.random() * 10}s`;

        // Add twinkle animation
        star.classList.add("animate-twinkle");

        starContainer.appendChild(star);
      }
    };

    createStars();
    // Recreate stars on window resize
    window.addEventListener("resize", createStars);

    return () => {
      window.removeEventListener("resize", createStars);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Login successful");
        setTimeout(() => {
          router.push("/admin");
        }, 1000);
      } else {
        toast.error(data.error || "Login failed");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="">
      <div className="fixed inset-0 h-calc(100vh - 10rem) flex items-center justify-center bg-black overflow-hidden">
        <Toaster position="top-right" />

        {/* Star field background */}
        <div
          id="stars-container"
          className="absolute inset-0 overflow-hidden"
        ></div>

        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black/80 to-blue-900/40 animate-gradientShift"></div>

        {/* Glowing orb */}
        <div className="absolute h-64 w-64 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 blur-3xl opacity-20 -top-20 -right-20 animate-pulse"></div>
        <div className="absolute h-96 w-96 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 blur-3xl opacity-20 -bottom-40 -left-40 animate-pulse"></div>

        {/* Login container */}
        <div
          className={`relativ z-50 w-full max-w-md px-8 py-10 mx-4 my-16 transition-all duration-1000 transform ${
            initialized
              ? "translate-y-0 opacity-100"
              : "translate-y-12 opacity-0"
          }`}
        >
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800/50 overflow-hidden">
            {/* Glowing top border */}
            <div className="h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-shimmer"></div>

            <div className="p-8">
              {/* Header */}
              <div className="flex flex-col items-center mb-8">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-600/20">
                  <LogIn className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Admin Access
                </h1>
                <p className="text-gray-400 text-sm">
                  Enter your credentials to continue
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="block text-gray-300 text-sm font-medium">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-800/90 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username"
                      required
                      autoComplete="username"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                      <div className="h-5 w-0.5 bg-purple-500"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-gray-300 text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 bg-gray-800/90 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center transition-all duration-200 ${
                    isLoading
                      ? "bg-gray-700"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:shadow-lg hover:shadow-purple-600/20"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <LogIn size={20} className="mr-2" />
                      Login
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              {/* <div className="mt-8 pt-6 border-t border-gray-800 text-center">
              <p className="text-gray-500 text-sm">Secure Admin Portal</p>
            </div> */}
            </div>
          </div>
        </div>

        {/* Add custom animations to the global stylesheet */}
        <style jsx global>{`
          @keyframes twinkle {
            0%,
            100% {
              opacity: 0.2;
            }
            50% {
              opacity: 1;
            }
          }

          @keyframes gradientShift {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -200% 50%;
            }
            100% {
              background-position: 200% 50%;
            }
          }

          .animate-twinkle {
            animation: twinkle 3s ease-in-out infinite;
          }

          .animate-gradientShift {
            background-size: 200% 200%;
            animation: gradientShift 15s ease infinite;
          }

          .animate-shimmer {
            background-size: 200% 100%;
            animation: shimmer 2s linear infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
