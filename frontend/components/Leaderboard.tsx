'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface LeaderboardEntry {
  username: string;
  userId: number;
  solvedCount: number;
}

interface LeaderboardProps {
  contestId: string;
}

export default function Leaderboard({ contestId }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();

    // Poll leaderboard every 15 seconds
    const interval = setInterval(fetchLeaderboard, 15000);

    return () => clearInterval(interval);
  }, [contestId]);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`/api/contests/${contestId}/leaderboard`);
      setLeaderboard(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">🏆 Leaderboard</h2>
        {!loading && (
          <span className="text-xs text-gray-500">Live</span>
        )}
      </div>
      
      {loading ? (
        <div className="text-center text-gray-500 py-4">Loading...</div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No submissions yet</div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index === 0
                  ? 'bg-yellow-50 border-2 border-yellow-400'
                  : index === 1
                  ? 'bg-gray-100 border-2 border-gray-400'
                  : index === 2
                  ? 'bg-orange-50 border-2 border-orange-400'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`font-bold text-lg ${
                  index === 0 ? 'text-yellow-600' :
                  index === 1 ? 'text-gray-600' :
                  index === 2 ? 'text-orange-600' :
                  'text-gray-500'
                }`}>
                  #{index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{entry.username}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-green-600">
                  {entry.solvedCount} solved
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
