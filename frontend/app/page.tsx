'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function Home() {
  const [contestId, setContestId] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contestId || !username) return;

    setLoading(true);
    setError('');

    try {
      // Try to login first
      let response = await axios.post('/api/users/login', { username });
      
      if (response.status === 404) {
        // User doesn't exist, register them
        response = await axios.post('/api/users/register', { username });
      }

      const userData = response.data;
      
      // Store username and userId in sessionStorage
      sessionStorage.setItem('username', userData.username);
      sessionStorage.setItem('userId', userData.id.toString());
      
      router.push(`/contest/${contestId}`);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // User not found, try to register
        try {
          const registerResponse = await axios.post('/api/users/register', { username });
          const userData = registerResponse.data;
          
          sessionStorage.setItem('username', userData.username);
          sessionStorage.setItem('userId', userData.id.toString());
          
          router.push(`/contest/${contestId}`);
        } catch (registerErr: any) {
          setError(registerErr.response?.data?.error || 'Failed to register user');
        }
      } else {
        setError(err.response?.data?.error || 'Failed to join contest');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Shodh-a-Code</h1>
          <p className="text-gray-600">Join a Coding Contest</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="contestId" className="block text-sm font-medium text-gray-700 mb-2">
              Contest ID
            </label>
            <input
              type="text"
              id="contestId"
              value={contestId}
              onChange={(e) => setContestId(e.target.value)}
              placeholder="Enter contest ID (e.g., 1)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-800"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-800"
              required
              disabled={loading}
            />
            <p className="mt-2 text-xs text-gray-500">
              New user? We'll automatically create an account for you!
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transform transition hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Joining...' : 'Join Contest'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>💡 Try Contest ID: <span className="font-semibold">1</span> or <span className="font-semibold">2</span></p>
          <p className="mt-2">✨ Any username works - we'll create an account automatically!</p>
        </div>
      </div>
    </div>
  );
}
