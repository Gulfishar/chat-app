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
  const [searchUser, setSearchuser] = useState([]);
  const [chatUser, setChatUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageUsers, setNewMessageUsers] = useState("");
  const { messages, setMessage, selectedConversation, setSelectedConversation } = userConversation();
  const { onlineUser, socket } = useSocketContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar toggle for mobile

  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      setNewMessageUsers(newMessage);
    });
    return () => socket?.off("newMessage");
  }, [socket, messages]);

  useEffect(() => {
    const chatUserHandler = async () => {
      setLoading(true);
      try {
        const chatters = await axios.get(`/api/user/currentchatters`);
        setLoading(false);
        setChatUser(chatters.data);
      } catch (error) {
        setLoading(false);
        console.error(error);
      }
    };
    chatUserHandler();
  }, []);

  const handelSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const search = await axios.get(`/api/user/search?search=${searchInput}`);
      setLoading(false);
      if (search.data.length === 0) {
        toast.info("User Not Found");
      } else {
        setSearchuser(search.data);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const handelUserClick = (user) => {
    onSelectUser(user);
    setSelectedConversation(user);
    setSelectedUserId(user._id);
    setNewMessageUsers("");
    setIsSidebarOpen(false); // Hide sidebar when a user is selected (on mobile)
  };

  const handSearchback = () => {
    setSearchuser([]);
    setSearchInput("");
  };

  const handelLogOut = async () => {
    const confirmlogout = window.prompt("Type 'UserName' To LOGOUT");
    if (confirmlogout === authUser.username) {
      setLoading(true);
      try {
        await axios.post("/api/auth/logout");
        toast.info("Logged out successfully");
        localStorage.removeItem("chatapp");
        setAuthUser(null);
        setLoading(false);
        navigate("/login");
      } catch (error) {
        setLoading(false);
        console.error(error);
      }
    } else {
      toast.info("LogOut Cancelled");
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

      {/* Sidebar (Hidden on mobile, visible on desktop) */}
      <div
        className={`fixed sm:relative bg-gray-400 text-black transition-transform duration-300 
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} sm:translate-x-0 flex-shrink-0 w-[250px] sm:w-[300px] h-full border-r`}
      >
        {/* Search Bar */}
        <div className="p-4 flex items-center gap-2 bg-gray-500">
          <form onSubmit={handelSearchSubmit} className="flex items-center bg-white rounded-full w-full sm:w-auto px-3 py-1">
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
            chatUser.map((user, index) => (
              <div key={user._id} onClick={() => handelUserClick(user)}
                   className={`flex gap-3 items-center rounded p-2 py-1 cursor-pointer hover:bg-gray-300 
                   ${selectedUserId === user?._id ? "bg-sky-500 text-white" : ""}`}>
                <div className={`avatar ${onlineUser.includes(user._id) ? "online" : ""}`}>
                  <div className="w-12 rounded-full">
                    <img src={user.profilepic} alt="user.img" />
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
          <button onClick={handelLogOut} className="hover:bg-red-600 w-10 sm:w-auto px-3 py-2 flex items-center gap-2 rounded-lg transition-all">
            <BiLogOut size={25} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
