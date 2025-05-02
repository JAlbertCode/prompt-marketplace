"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setCredits(session.user.credits || 0);
    }
  }, [session, status, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      if (response.ok) {
        toast.success("Profile updated successfully");
        // Update the session data
        await update({ name });
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update password");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyCredits = async (amount: number) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to payment page
        window.location.href = data.paymentUrl;
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to initiate payment");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  disabled
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleUpdatePassword}>
              <div className="mb-4">
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  id="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Credits</h2>
            <div className="mb-4">
              <p className="text-2xl font-bold">{credits}</p>
              <p className="text-sm text-gray-500">Available Credits</p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleBuyCredits(1000)}
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300"
              >
                Buy 1,000 Credits ($1.00)
              </button>
              <button
                onClick={() => handleBuyCredits(5000)}
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300"
              >
                Buy 5,000 Credits ($5.00)
              </button>
              <button
                onClick={() => handleBuyCredits(10000)}
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300"
              >
                Buy 10,000 Credits ($10.00)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                  // Implement account deletion logic
                }
              }}
              className="w-full inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}