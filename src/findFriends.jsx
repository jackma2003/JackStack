import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, ArrowLeft, Check } from 'lucide-react';
import './input.css'

const FindFriends = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sentRequests, setSentRequests] = useState(new Set());

    // Search for users
    const searchUsers = async () => {
        if (!searchQuery.trim()) return;
        
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery)}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message);
            }
            
            setUsers(data);
        } catch (err) {
            setError('Failed to search users');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Send friend request
    const sendFriendRequest = async (userId) => {
        try {
            const response = await fetch('/api/friends/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ receiverId: userId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setSentRequests(prev => new Set([...prev, userId]));
        } catch (err) {
            setError('Failed to send friend request');
            console.error('Friend request error:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mr-4 p-2 rounded hover:bg-gray-200"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-2xl font-bold">Find Friends</h1>
                </div>

                {/* Search Section */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Search users by username or email"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                            className="flex-1 px-4 py-2 border rounded-md"
                        />
                        <button 
                            onClick={searchUsers} 
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                            {error}
                        </div>
                    )}
                </div>

                {/* Results Section */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-8">Searching...</div>
                    ) : users.length > 0 ? (
                        users.map((user) => (
                            <div key={user._id} className="bg-white rounded-lg shadow p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.username}
                                                className="h-12 w-12 rounded-full"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-500 text-lg">
                                                    {user.username[0].toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-medium">{user.username}</h3>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    {sentRequests.has(user._id) ? (
                                        <div className="flex items-center text-green-600">
                                            <Check className="h-5 w-5 mr-2" />
                                            <span>Request Sent</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => sendFriendRequest(user._id)}
                                            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Add Friend
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : searchQuery && !loading && (
                        <div className="text-center py-8 text-gray-500">
                            No users found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindFriends;