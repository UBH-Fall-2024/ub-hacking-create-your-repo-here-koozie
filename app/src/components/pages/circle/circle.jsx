import { React, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const messagesData = {
};

const ChatBubble = ({ text, sender }) => {
  return (
    <div
      style={{
        maxWidth: "80%",
        backgroundColor: sender === "me" ? "#1E3A8A" : "#e1e1e1",
        color: sender === "me" ? "white" : "black",
        padding: "10px 20px",
        borderRadius: "20px",
        margin: "10px 0",
        alignSelf: sender === "me" ? "flex-end" : "flex-start",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {text}
    </div>
  );
};

const Messenger = () => {
  const { circleId } = useParams();


  const [title, setTitle] = useState(null);
  const [messages, setMessages] = useState(messagesData[circleId] || []);
  const [messageInput, setMessageInput] = useState("");

  const updateData = async () => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/circle/${circleId}`, {
        method: 'GET',
        headers: {
          "Authorization": "Bearer " + token,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      setMessages([...data?.data]);
      setTitle([...data?.chatname])

    } catch (err) {
    }
  };

  useEffect(() => {
    updateData();
  }, []);


  const sendMessage = async () => {
    const message = messageInput.trim();

    if (message) {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/circle/${circleId}`, {
        method: 'POST',
        headers: {
          "Authorization": "Bearer " + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message
        }),
      });

      updateData();
      setMessageInput("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "column" }}>
      <div
        style={{
          backgroundColor: "#1E3A8A",
          padding: "15px",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "10px",
            }}
          >
            <span style={{ fontSize: "20px", color: "#1E3A8A" }}>{circleId}</span>
          </div>
          <span style={{ fontSize: "18px" }}>{title}</span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#f0f0f0",
          overflowY: "scroll",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((message, index) => (
          <ChatBubble key={index} text={message.text} sender={message.sender} />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px",
          backgroundColor: "#fff",
          borderTop: "1px solid #ddd",
        }}
      >
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message"
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "20px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            backgroundColor: "#1E3A8A",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "20px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Messenger;
