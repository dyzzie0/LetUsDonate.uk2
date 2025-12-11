import React, { useState } from "react";

function FAQChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user's message to chat
    setMessages(prev => [...prev, { sender: "user", text: input }]);

    // Send question to Laravel backend
    const res = await fetch("http://localhost:8000/api/ask-faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });
    const data = await res.json();

    // Add bot reply
    setMessages(prev => [...prev, { sender: "bot", text: data.answer }]);

    setInput("");
  };

  return (
    <div className="chatbot">
      <div className="chat-box">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.sender}`}>{m.text}</div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={input}
          placeholder="Ask a question..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default FAQChatBot;
