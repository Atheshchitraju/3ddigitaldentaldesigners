import { useEffect, useRef, useState } from "react";
import logo from "../assets/DDD.webp";

type Message = {
  type: "bot" | "user";
  text: string;
  link?: { label: string; url: string };
};

async function getAIResponse(
  question: string
): Promise<{ reply: string; link?: { label: string; url: string } }> {
  const response = await fetch("http://localhost:5000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: question }),
  });

  if (!response.ok) {
    throw new Error("Failed to get a response");
  }

  const data = await response.json();
  return { reply: data.reply as string, link: data.link };
}

function LinkArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="link-arrow-icon"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function MessageLinkButton(props: { label: string; url: string }) {
  return (
    <a href={props.url} className="message-link-button">
      <span>{props.label}</span>
      <LinkArrowIcon />
    </a>
  );
}

export default function FaqChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      type: "bot",
      text: "Hello! Welcome to Digital Dental Designers. How can we help you today?",
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  const openChat = () => {
    setIsOpen(true);
  };

  const handleAskAI = async () => {
    const question = inputValue.trim();
    if (!question || isLoading) return;

    setMessages((prev) => [...prev, { type: "user", text: question }]);
    setInputValue("");
    setIsLoading(true);

    try {
      const { reply, link } = await getAIResponse(question);
      setMessages((prev) => [...prev, { type: "bot", text: reply, link }]);
    } catch (error) {
      console.error("CHAT ERROR:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Sorry, something went wrong while reaching our assistant. Please try again or contact us directly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAskAI();
    }
  };

  return (
    <>
      {isOpen ? (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-header-avatar">
                <img src={logo} alt="Digital Dental Designers" />
              </div>
              <div>
                <h3 className="chatbot-header-title">Digital Dental Designers</h3>
                <div className="chatbot-header-status">
                  <span className="chatbot-status-dot" />
                  <p>AI Assistant &middot; Online</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="chatbot-close-button"
              aria-label="Close chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message, index) => {
              const isUser = message.type === "user";
              const rowClass = isUser ? "chatbot-row chatbot-row-user" : "chatbot-row chatbot-row-bot";
              const bubbleClass = isUser ? "chatbot-bubble chatbot-bubble-user" : "chatbot-bubble chatbot-bubble-bot";

              return (
                <div key={index} className={rowClass}>
                  <div className={bubbleClass}>
                    <p>{message.text}</p>
                    {message.link ? (
                      <MessageLinkButton label={message.link.label} url={message.link.url} />
                    ) : null}
                  </div>
                </div>
              );
            })}

            {isLoading ? (
              <div className="chatbot-row chatbot-row-bot">
                <div className="chatbot-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          {/* Ask AI input */}
          <div className="chatbot-input-row">
            <div className="chatbot-input-wrap">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask our AI assistant..."
                className="chatbot-input"
              />
              <button
                onClick={handleAskAI}
                disabled={isLoading || !inputValue.trim()}
                className="chatbot-send-button"
                aria-label="Send question"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: "16px", height: "16px" }}
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Floating launcher */}
      <div className="chatbot-launcher">
        <div className="chatbot-fab-wrap">
          {!isOpen ? (
            <>
              <span className="chatbot-ping" />
              <div className="chatbot-ask-tooltip" onClick={openChat}>
                Ask AI
              </div>
            </>
          ) : null}

          <button
            onClick={() => (isOpen ? setIsOpen(false) : openChat())}
            className="chatbot-fab"
            aria-label={isOpen ? "Close chat" : "Open AI assistant chat"}
          >
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="chatbot-fab-close-icon"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <img src={logo} alt="Chat with us" className="chatbot-fab-logo" />
            )}
          </button>
        </div>
      </div>

      <style>{`
        .chatbot-window * {
          box-sizing: border-box;
          font-family: inherit;
        }

        .chatbot-window {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }
        @media (min-width: 640px) {
          .chatbot-window {
            inset: auto;
            bottom: 96px;
            right: 24px;
            height: 600px;
            max-height: calc(100vh - 120px);
            width: 380px;
            max-width: calc(100vw - 32px);
            border-radius: 16px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 12px 40px -10px rgba(0, 0, 0, 0.15), 0 4px 12px -5px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }
        }

        .chatbot-header {
          position: relative;
          display: flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          color: #ffffff;
          background: linear-gradient(135deg, #5b21b6, #7e22ce);
        }
        .chatbot-header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .chatbot-header-avatar {
          display: flex;
          height: 40px;
          width: 40px;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 9999px;
          background: #ffffff;
          border: 2px solid rgba(255,255,255,0.2);
        }
        
        .chatbot-header-avatar img {
          height: 100%;
          width: 100%;
          object-fit: cover;
          transform: scale(1.35); 
          border-radius: 50%;
        }
        
        .chatbot-header-title {
          font-size: 15px;
          font-weight: 600;
          line-height: 1.2;
          color: #ffffff;
          margin: 0 0 2px 0;
        }
        .chatbot-header-status {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .chatbot-header-status p {
          font-size: 12px;
          color: #e9d5ff;
          margin: 0;
        }
        .chatbot-status-dot {
          height: 6px;
          width: 6px;
          border-radius: 9999px;
          background: #34d399;
        }
        .chatbot-close-button {
          display: flex;
          height: 32px;
          width: 32px;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: #e9d5ff;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .chatbot-close-button:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }

        .chatbot-messages {
          display: flex;
          flex: 1 1 auto;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          padding: 20px;
          background: #ffffff;
        }
        .chatbot-row {
          display: flex;
        }
        .chatbot-row-user {
          justify-content: flex-end;
        }
        .chatbot-row-bot {
          justify-content: flex-start;
        }
        .chatbot-bubble {
          max-width: 85%;
          border-radius: 16px;
          padding: 12px 16px;
          font-size: 14px;
          line-height: 1.5;
        }
        .chatbot-bubble p {
          margin: 0;
        }
        .chatbot-bubble-user {
          border-bottom-right-radius: 4px;
          color: #ffffff;
          background: #7e22ce;
        }
        .chatbot-bubble-bot {
          border-bottom-left-radius: 4px;
          color: #1f2937;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
        }

        .message-link-button {
          margin-top: 10px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 500;
          color: #7e22ce;
          text-decoration: none;
          background: #ffffff;
          border: 1px solid #d8b4fe;
          transition: all 0.2s;
        }
        .message-link-button:hover {
          background: #faf5ff;
          border-color: #7e22ce;
        }

        .chatbot-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          border-radius: 16px;
          border-bottom-left-radius: 4px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          padding: 14px 18px;
        }
        .chatbot-typing span {
          height: 6px;
          width: 6px;
          border-radius: 9999px;
          background: #9ca3af;
          animation: chatbot-bounce 1s infinite;
        }
        .chatbot-typing span:nth-child(1) { animation-delay: -0.3s; }
        .chatbot-typing span:nth-child(2) { animation-delay: -0.15s; }
        @keyframes chatbot-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }

        .chatbot-input-row {
          flex-shrink: 0;
          border-top: 1px solid #f3f4f6;
          background: #ffffff;
          padding: 16px 20px;
        }
        .chatbot-input-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .chatbot-input {
          flex: 1 1 auto;
          border-radius: 24px;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          padding: 12px 16px;
          font-size: 14px;
          color: #1f2937;
          outline: none;
          transition: all 0.2s;
        }
        .chatbot-input:focus {
          border-color: #a855f7;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
        }
        .chatbot-send-button {
          display: flex;
          flex-shrink: 0;
          height: 40px;
          width: 40px;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          color: #ffffff;
          background: #7e22ce;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .chatbot-send-button:hover {
          background: #6b21a8;
        }
        .chatbot-send-button:disabled {
          cursor: not-allowed;
          background: #d1d5db;
        }

        .chatbot-launcher {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 50;
        }

        .chatbot-fab-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .chatbot-ask-tooltip {
          position: absolute;
          right: calc(100% + 14px);
          white-space: nowrap;
          background: #ffffff;
          color: #5b21b6;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          cursor: pointer;
          animation: chatbot-fade-in 0.3s ease-out;
          transition: transform 0.2s;
        }
        .chatbot-ask-tooltip:hover {
          transform: scale(1.03);
        }
        
        .chatbot-ask-tooltip::after {
          content: '';
          position: absolute;
          top: 50%;
          right: -5px;
          transform: translateY(-50%);
          border-width: 6px 0 6px 6px;
          border-style: solid;
          border-color: transparent transparent transparent #ffffff;
        }
        
        .chatbot-ask-tooltip::before {
          content: '';
          position: absolute;
          top: 50%;
          right: -6px;
          transform: translateY(-50%);
          border-width: 6px 0 6px 6px;
          border-style: solid;
          border-color: transparent transparent transparent #e5e7eb;
          z-index: -1;
        }

        @keyframes chatbot-fade-in {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .chatbot-ping {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: rgba(126, 34, 206, 0.35);
          animation: chatbot-ping-anim 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes chatbot-ping-anim {
          75%, 100% { transform: scale(1.4); opacity: 0; }
        }

        .chatbot-fab {
          position: relative;
          display: flex;
          height: 56px;
          width: 56px;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          color: #ffffff;
          background: #5b21b6;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
          border: none;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), background 0.2s;
          overflow: hidden;
          padding: 0;
        }
        
        .chatbot-fab:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          background: #4c1d95;
        }

        .chatbot-fab-logo {
          height: 100%;
          width: 100%;
          object-fit: cover;
          transform: scale(1.35);
          border-radius: 50%;
        }

        .chatbot-fab-close-icon {
          width: 24px;
          height: 24px;
        }
      `}</style>
    </>
  );
}