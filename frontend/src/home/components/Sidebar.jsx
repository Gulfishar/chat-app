import React, { useState, useEffect } from "react";
import { FaSearch, FaBars } from "react-icons/fa";
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
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { setSelectedConversation } = userConversation();
  const { onlineUser } = useSocketContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/user/all`);
        setAllUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Search users dynamically
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchInput(query);

    if (!query) {
      const response = await axios.get(`/api/user/all`);
      setAllUsers(response.data);
      return;
    }

    try {
      const response = await axios.get(`/api/user/search?search=${query}`);
      setAllUsers(response.data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // Select user for chat
  const handleUserClick = (user) => {
    onSelectUser(user);
    setSelectedConversation(user);
    setSelectedUserId(user._id);
    setSearchInput("");
    setIsSidebarOpen(false);
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
          <div className="relative w-full">
            <input
              value={searchInput}
              onChange={handleSearchChange}
              type="text"
              className="w-full px-4 py-2 rounded-full bg-white text-black outline-none"
              placeholder="Search users..."
            />
            <FaSearch className="absolute right-3 top-3 text-gray-500" />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-grow overflow-y-auto h-[calc(100vh-150px)] p-2">
          {loading ? (
            <p className="text-center text-gray-600">Loading users...</p>
          ) : allUsers.length > 0 ? (
            allUsers.map((user) => (
              <div key={user._id} onClick={() => handleUserClick(user)}
                   className={`flex gap-3 items-center rounded p-2 cursor-pointer hover:bg-gray-300 
                   ${selectedUserId === user?._id ? "bg-sky-500 text-white" : ""}`}>
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src={user.profilepic || "/default-avatar.png"}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                  {onlineUser.includes(user._id) && (
                    <span className="absolute bottom-1 right-1 bg-green-500 w-3 h-3 rounded-full"></span>
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="font-bold">{user.username}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-yellow-500 font-bold">
              No users found.
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="p-4 flex items-center justify-between bg-gray-500">
  <div className="flex items-center gap-3">
    <img
      src={authUser?.profilepic || "/default-avatar.png"}
      className="h-10 w-10 sm:h-12 sm:w-12 rounded-full cursor-pointer hover:scale-110"
      alt="Profile"
    />
    <span className="text-white font-medium hidden sm:block">{authUser?.username || "User"}</span>
  </div>
  
  <button onClick={handleLogout} className="hover:bg-red-600 px-3 py-2 flex items-center gap-2 rounded-lg transition-all">
    <BiLogOut size={25} />
    <span className="hidden sm:inline">Logout</span>
  </button>
</div>

      </div>
    </div>
  );
};

export default Sidebar;
