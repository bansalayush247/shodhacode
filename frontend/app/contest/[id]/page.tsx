'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import Leaderboard from '@/components/Leaderboard';

interface Problem {
  id: number;
  title: string;
  description: string;
  inputExample: string;
  outputExample: string;
}

interface Contest {
  id: number;
  name: string;
  problems: Problem[];
}

interface Submission {
  id: number;
  status: string;
  code: string;
  submittedAt: string;
}

export default function ContestPage() {
  const params = useParams();
  const contestId = params.id as string;
  
  const [contest, setContest] = useState<Contest | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>('# Write your Python code here\n');
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(1);

  useEffect(() => {
    // Get username and userId from sessionStorage
    const storedUsername = sessionStorage.getItem('username') || 'Guest';
    const storedUserId = parseInt(sessionStorage.getItem('userId') || '1');
    setUsername(storedUsername);
    setUserId(storedUserId);

    // Fetch contest details
    axios.get(`/api/contests/${contestId}`)
      .then(response => {
        setContest(response.data);
        if (response.data.problems && response.data.problems.length > 0) {
          setSelectedProblem(response.data.problems[0]);
        }
      })
      .catch(error => console.error('Error fetching contest:', error));
  }, [contestId]);

  const handleSubmit = async () => {
    if (!selectedProblem) return;

    setLoading(true);
    try {
      // Submit code
      const response = await axios.post('/api/submissions', {
        user: { id: userId }, // Use the actual logged-in user ID
        problem: { id: selectedProblem.id },
        code: code
      });

      const newSubmission = response.data;
      setSubmission(newSubmission);

      // Start polling for status updates
      pollSubmissionStatus(newSubmission.id);
    } catch (error) {
      console.error('Error submitting code:', error);
      setLoading(false);
    }
  };

  const pollSubmissionStatus = (submissionId: number) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/submissions/${submissionId}`);
        const updatedSubmission = response.data;
        setSubmission(updatedSubmission);

        // Stop polling if status is final
        if (updatedSubmission.status !== 'Pending' && updatedSubmission.status !== 'Running') {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error polling submission:', error);
        clearInterval(interval);
        setLoading(false);
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      setLoading(false);
    }, 30000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Wrong Answer':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Running':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!contest) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading contest...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contest.name}</h1>
            <p className="text-sm text-gray-500">Welcome, {username}!</p>
          </div>
          <div className="text-sm text-gray-600">
            Contest ID: <span className="font-semibold">{contestId}</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Problem List & Leaderboard */}
          <div className="lg:col-span-1 space-y-6">
            {/* Problem List */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Problems</h2>
              <div className="space-y-2">
                {contest.problems.map((problem) => (
                  <button
                    key={problem.id}
                    onClick={() => setSelectedProblem(problem)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      selectedProblem?.id === problem.id
                        ? 'bg-blue-100 border-2 border-blue-500 text-blue-700'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="font-medium">{problem.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <Leaderboard contestId={contestId} />
          </div>

          {/* Middle Column: Problem Description */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 h-full">
              {selectedProblem ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedProblem.title}</h2>
                  <div className="space-y-4 text-gray-700">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Description</h3>
                      <p>{selectedProblem.description}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Example Input</h3>
                      <pre className="bg-gray-100 p-3 rounded border">{selectedProblem.inputExample}</pre>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Example Output</h3>
                      <pre className="bg-gray-100 p-3 rounded border">{selectedProblem.outputExample}</pre>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Select a problem to view details</p>
              )}
            </div>
          </div>

          {/* Right Column: Code Editor & Submission */}
          <div className="lg:col-span-1 space-y-6">
            {/* Code Editor */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-800 px-4 py-2 text-white text-sm font-medium">
                Code Editor (Python)
              </div>
              <div className="h-96">
                <Editor
                  height="100%"
                  defaultLanguage="python"
                  value={code}
                  onChange={(value: string | undefined) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedProblem}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-blue-700 transform transition hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Submitting...' : 'Submit Code'}
            </button>

            {/* Submission Status */}
            {submission && (
              <div className={`border-2 rounded-lg p-4 ${getStatusColor(submission.status)}`}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Submission Status</h3>
                  <span className="text-xs">ID: {submission.id}</span>
                </div>
                <div className="text-2xl font-bold mb-1">{submission.status}</div>
                <div className="text-xs opacity-75">
                  {new Date(submission.submittedAt).toLocaleString()}
                </div>
                {loading && submission.status === 'Running' && (
                  <div className="mt-3">
                    <div className="animate-pulse flex space-x-2">
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="h-2 w-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
