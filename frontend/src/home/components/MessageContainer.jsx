import React, { useEffect, useState, useRef } from "react";
import userConversation from "../../Zustans/useConversation";
import { useAuth } from "../../context/AuthContext";
import { TiMessages } from "react-icons/ti";
import { IoArrowBackSharp, IoSend } from "react-icons/io5";
import axios from "axios";
import { useSocketContext } from "../../context/SocketContext";
import notify from "../../assets/sound/notification.mp3";

const MessageContainer = ({ onBackUser }) => {
  const { messages, selectedConversation, setMessage } = userConversation();
  const { socket } = useSocketContext();
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendData, setSendData] = useState("");
  const lastMessageRef = useRef();

  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      const sound = new Audio(notify);
      sound.play();
      setMessage([...messages, newMessage]);
    });

    return () => socket?.off("newMessage");
  }, [socket, setMessage, messages]);

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/message/${selectedConversation?._id}`);
        const data = res.data;
        if (!data.success) {
          console.log(data.message);
        }
        setMessage(data);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    };

    if (selectedConversation?._id) getMessages();
  }, [selectedConversation?._id, setMessage]);

  const handleMessages = (e) => setSendData(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await axios.post(`/api/message/send/${selectedConversation?._id}`, { messages: sendData });
      const data = res.data;
      if (!data.success) {
        console.log(data.message);
      }
      setMessage([...messages, data]);
      setSendData("");
    } catch (error) {
      console.log(error);
    }
    setSending(false);
  };

  return (
    <div className="w-full md:min-w-[500px] h-[99%] flex flex-col p-2">
      {selectedConversation === null ? (
        <div className="flex flex-col items-center justify-center w-full h-full text-center text-gray-950">
          <p className="text-xl sm:text-2xl font-semibold">Welcome!!👋 {authUser.username} 😉</p>
          <p className="text-sm sm:text-lg">Select a chat to start messaging</p>
          <TiMessages className="text-6xl text-gray-500" />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex justify-between items-center bg-sky-600 p-2 rounded-lg">
            <button onClick={() => onBackUser(true)} className="md:hidden bg-black p-2 rounded-full">
              <IoArrowBackSharp size={25} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              <img className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" src={selectedConversation?.profilepic} />
              <span className="text-white text-sm sm:text-lg font-bold">{selectedConversation?.username}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-2 space-y-2">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <div className="loading loading-spinner"></div>
              </div>
            )}
            {!loading && messages?.length === 0 && (
              <p className="text-center text-white">Send a message to start a conversation</p>
            )}
            {!loading &&
              messages?.length > 0 &&
              messages.map((message) => (
                <div key={message?._id} ref={lastMessageRef} className="flex flex-col">
                  <div className={`flex ${message.senderId === authUser._id ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`rounded-lg p-2 max-w-xs sm:max-w-md ${
                        message.senderId === authUser._id ? "bg-sky-600 text-white" : "bg-gray-300 text-black"
                      }`}
                    >
                      {message?.message}
                    </div>
                  </div>
                  <div
                    className={`text-xs opacity-80 text-black ${
                      message.senderId === authUser._id ? "text-right" : "text-left"
                    }`}
                  >
                    {new Date(message?.createdAt).toLocaleDateString("en-IN")}{" "}
                    {new Date(message?.createdAt).toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </div>
                </div>
              ))}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSubmit} className="w-full p-2">
            <div className="flex items-center bg-white rounded-full p-2 shadow-md">
              <input
                value={sendData}
                onChange={handleMessages}
                required
                type="text"
                className="flex-1 bg-transparent outline-none px-2 text-sm sm:text-base text-black"
                placeholder="Type a message..."
              />
              <button type="submit">
                {sending ? (
                  <div className="loading loading-spinner"></div>
                ) : (
                  <IoSend size={25} className="text-sky-700 cursor-pointer bg-white-800 p-1 rounded-full" />
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default MessageContainer;
