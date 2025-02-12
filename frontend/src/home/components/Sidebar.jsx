import React, { useState, useEffect } from "react";
import { FaSearch, FaBars } from "react-icons/fa";
import { IoArrowBackSharp } from "react-icons/io5";
import { BiLogOut } from "react-icons/bi";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import userConversation from "../../Zustans/useConversation";
import { useSocketContext } from "../../context/SocketContext";

const Sidebar = ({ onSelectUser }) => {
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [searchUser, setSearchUser] = useState([]);
  const [chatUser, setChatUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageUsers, setNewMessageUsers] = useState("");
  const { messages, setSelectedConversation } = userConversation();
  const { onlineUser, socket } = useSocketContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar toggle for mobile

  // Listen for new messages
  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      setNewMessageUsers(newMessage);
    });
    return () => socket?.off("newMessage");
  }, [socket, messages]);

  // Fetch chat users
  useEffect(() => {
    const fetchChatUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/user/currentchatters`);
        setChatUser(response.data);
      } catch (error) {
        console.error("Error fetching chat users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChatUsers();
  }, []);

  // Search users
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.get(`/api/user/search?search=${searchInput}`);
      setSearchUser(response.data.length > 0 ? response.data : []);
      if (response.data.length === 0) toast.info("User Not Found");
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Select a user to chat
  const handleUserClick = (user) => {
    onSelectUser(user);
    setSelectedConversation(user);
    setSelectedUserId(user._id);
    setNewMessageUsers("");
    setIsSidebarOpen(false); // Hide sidebar on mobile
  };

  // Clear search results
  const handleSearchBack = () => {
    setSearchUser([]);
    setSearchInput("");
  };

  // Logout function
  const handleLogout = async () => {
    const confirmLogout = window.prompt("Type 'UserName' To LOGOUT");
    if (confirmLogout === authUser.username) {
      setLoading(true);
      try {
        await axios.post("/api/auth/logout");
        toast.info("Logged out successfully");
        localStorage.removeItem("chatapp");
        setAuthUser(null);
        navigate("/login");
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        setLoading(false);
      }
    } else {
      toast.info("Logout Cancelled");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Mobile Toggle Button */}
      <button
        className="sm:hidden absolute top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-full"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed sm:relative bg-gray-400 text-black transition-transform duration-300 
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 flex-shrink-0 w-[250px] sm:w-[300px] h-full border-r`}
      >
        {/* Search Bar */}
        <div className="p-4 flex items-center gap-2 bg-gray-500">
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-white rounded-full w-full sm:w-auto px-3 py-1">
            <FaSearch className="text-gray-500" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              type="text"
              className="px-4 w-full sm:w-auto bg-transparent outline-none rounded-full text-black"
              placeholder="Search user"
            />
          </form>
        </div>

        {/* Chat List */}
        <div className="flex-grow overflow-y-auto h-[calc(100vh-150px)] p-2">
          {chatUser.length === 0 ? (
            <div className="font-bold flex flex-col items-center text-xl text-yellow-500">
              <h1>Why are you Alone? 🤔</h1>
              <h1>Search username to chat</h1>
            </div>
          ) : (
            chatUser.map((user) => (
              <div key={user._id} onClick={() => handleUserClick(user)}
                   className={`flex gap-3 items-center rounded p-2 py-1 cursor-pointer hover:bg-gray-300 
                   ${selectedUserId === user?._id ? "bg-sky-500 text-white" : ""}`}>
                <div className={`avatar ${onlineUser.includes(user._id) ? "online" : ""}`}>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    {user.profilepic ? (
                      <img src={user.profilepic} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="flex items-center justify-center w-full h-full text-gray-600 text-sm">
                        No Image
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col flex-1">
                  <p className="font-bold">{user.username}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Logout Button */}
        <div className="p-4 flex items-center justify-between bg-gray-500">
          <img
            src={authUser?.profilepic}
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full cursor-pointer hover:scale-110"
            alt="Profile"
          />
          <button onClick={handleLogout} className="hover:bg-red-600 w-10 sm:w-auto px-3 py-2 flex items-center gap-2 rounded-lg transition-all">
            <BiLogOut size={25} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
