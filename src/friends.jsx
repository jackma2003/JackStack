// friends.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserX, Search } from 'lucide-react';
import './input.css';

const Friends = () => {
    const navigate = useNavigate();
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Get friends on component mount
    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            const response = await fetch('/api/friends/friends', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            console.log('Fetched friends:', data);
            setFriends(data);
        } catch (err) {
            console.error('Error fetching friends:', err);
            setError('Failed to load friends');
        } finally {
            setLoading(false);
        }
    };

    const removeFriend = async (friendId) => {
        if (!window.confirm('Are you sure you want to remove this friend?')) {
            return;
        }

        try {
            const response = await fetch(`/api/friends/${friendId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to remove friend');
            }

            // Remove friend from local state
            setFriends(friends.filter(friend => friend._id !== friendId));
        } catch (err) {
            console.error('Error removing friend:', err);
            setError('Failed to remove friend');
        }
    };

    const filteredFriends = friends.filter(friend => 
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <h1 className="text-2xl font-bold">My Friends</h1>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex items-center border rounded-md px-3 py-2">
                        <Search className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search friends..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 outline-none"
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-md">
                        {error}
                    </div>
                )}

                {/* Friends List */}
                {loading ? (
                    <div className="text-center py-8">Loading friends...</div>
                ) : friends.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg shadow">
                        <p className="text-gray-500">You haven't added any friends yet</p>
                        <button
                            onClick={() => navigate('/find-friends')}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Find Friends
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {filteredFriends.map((friend) => (
                            <div key={friend._id} className="bg-white rounded-lg shadow p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {friend.avatar ? (
                                            <img
                                                src={friend.avatar}
                                                alt={friend.username}
                                                className="h-12 w-12 rounded-full"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-500 text-lg">
                                                    {friend.username[0].toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-medium">{friend.username}</h3>
                                            <p className="text-sm text-gray-500">{friend.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFriend(friend._id)}
                                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                                        title="Remove friend"
                                    >
                                        <UserX className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Friends;