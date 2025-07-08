import React from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
const Profile = () => {
  const {
    user,
    logout
  } = useAuth();
  if (!user) {
    return <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
        <p className="mb-6">You need to be logged in to view your profile.</p>
      </div>;
  }
  return <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="mt-4 space-y-2">
                <p>
                  <span className="font-medium">Member since:</span> January
                  2023
                </p>
                <p>
                  <span className="font-medium">School:</span> University of
                  California, Berkeley
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
                <Button variant="primary">Edit Profile</Button>
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">My Listings</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-center text-gray-500 py-8">
            You don't have any active listings.
          </p>
          <div className="text-center">
            <Button variant="primary">Create New Listing</Button>
          </div>
        </div>
      </div>
    </div>;
};
export default Profile;