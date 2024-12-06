import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { io } from 'socket.io-client';
import './input.css'

const FriendRequestNotifications = () => {
    const [socket, setSocket] = useState(null);
    const [requests, setRequests] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(process.env.REACT_APP_API_URL, {
            auth: {
                token: localStorage.getItem('token')
            }
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

        newSocket.on('friendRequest', (data) => {
            setRequests(prev => [...prev, data]);
        });

        newSocket.on('friendRequestAccepted', (data) => {
            // Handle accepted request notification
            console.log('Friend request accepted:', data);
        });

        setSocket(newSocket);

        // Fetch existing requests
        fetchRequests();

        return () => newSocket.close();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await fetch('/api/friends/requests', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setRequests(data);
        } catch (err) {
            console.error('Error fetching requests:', err);
        }
    };

    const handleRequest = async (requestId, status) => {
        try {
            await fetch(`/api/friends/request/${requestId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status })
            });

            // Remove request from list
            setRequests(prev => prev.filter(req => req._id !== requestId));
        } catch (err) {
            console.error('Error handling request:', err);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 rounded-full hover:bg-gray-100 relative"
            >
                <Bell className="h-6 w-6" />
                {requests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {requests.length}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">Friend Requests</h3>
                        {requests.length === 0 ? (
                            <p className="text-gray-500 text-center">No pending requests</p>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((request) => (
                                    <div key={request._id} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {request.sender.avatar ? (
                                                <img
                                                    src={request.sender.avatar}
                                                    alt={request.sender.username}
                                                    className="h-10 w-10 rounded-full"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <span className="text-gray-500 text-lg">
                                                        {request.sender.username[0].toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <span className="font-medium">{request.sender.username}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                                onClick={() => handleRequest(request._id, 'accepted')}
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                                                onClick={() => handleRequest(request._id, 'rejected')}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FriendRequestNotifications;