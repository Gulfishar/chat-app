import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocketContext = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUser, setOnlineUser] = useState([]);
    const { authUser } = useAuth();

    useEffect(() => {
        if (authUser) {
            const socket = io("https://slrtech-chatapp.onrender.com/", {
                query: {
                    userId: authUser?._id,
                },
                transports: ["websocket"], // Use WebSocket transport
                withCredentials: true,    // Allow credentials (cookies/headers)
            });

            socket.on("getOnlineUsers", (users) => {
                setOnlineUser(users);
            });

            setSocket(socket);

            // Cleanup on unmount or when authUser changes
            return () => {
                if (socket) {
                    socket.disconnect(); // Properly disconnect socket
                }
            };
        } else {
            if (socket) {
                socket.disconnect(); // Disconnect socket if authUser is null
                setSocket(null);
            }
        }
    }, [authUser]);

    return (
        <SocketContext.Provider value={{ socket, onlineUser }}>
            {children}
        </SocketContext.Provider>
    );
};
