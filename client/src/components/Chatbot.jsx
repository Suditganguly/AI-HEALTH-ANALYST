import React, { useState, useRef, useEffect } from 'react';
// Remove Gemini SDK import

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am your health assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const qaPairs = [
    {
      patterns: [/hello/i, /hi/i, /hey/i],
      answer: "Hello! How can I assist you with your health today?"
    },
    {
      patterns: [/medicine/i, /medication/i, /pill/i],
      answer: "Please remember to take your medicines on time. Do you want to set a reminder?",
      followUp: {
        patterns: [/yes/i, /reminder/i],
        answer: "Great! I can help you set a medicine reminder. What time should I remind you?"
      }
    },
    {
      patterns: [/water/i, /drink/i],
      answer: "Drinking enough water is important for your health. Aim for 8 glasses a day!"
    },
    {
      patterns: [/doctor/i, /appointment/i, /physician/i],
      answer: "Would you like help finding a doctor or booking an appointment?",
      followUp: {
        patterns: [/yes/i, /find/i, /book/i],
        answer: "Please provide your location or specialty you need."
      }
    },
    {
      patterns: [/bye/i, /goodbye/i, /see you/i],
      answer: "Goodbye! Stay healthy!"
    },
    // Add more Q&A pairs as needed
  ];

  let lastFollowUp = null;

  function getAdvancedBotResponse(userInput) {
    // Check for follow-up context first
    if (lastFollowUp && lastFollowUp.patterns.some(pattern => pattern.test(userInput))) {
      const answer = lastFollowUp.answer;
      lastFollowUp = null;
      return answer;
    }
    // Check main Q&A pairs
    for (const qa of qaPairs) {
      if (qa.patterns.some(pattern => pattern.test(userInput))) {
        if (qa.followUp) {
          lastFollowUp = qa.followUp;
        } else {
          lastFollowUp = null;
        }
        return qa.answer;
      }
    }
    lastFollowUp = null;
    return null; // No match, use Gemini
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    setInput('');
    setLoading(true);
    const userInput = input;
    const botResponse = getAdvancedBotResponse(userInput);
    if (botResponse !== null) {
      setTimeout(() => {
        setMessages(msgs => [...msgs, { sender: 'bot', text: botResponse }]);
        setLoading(false);
      }, 500);
    } else {
      // Call backend LLaMA chatbot proxy
      try {
        const res = await fetch('https://ai-health-analyst.onrender.com/api/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userInput })
        });
        if (res.status === 429) {
          setMessages(msgs => [
            ...msgs,
            {
              sender: 'bot',
              text: 'Sorry, the AI assistant has reached its usage limit for now. This is a quota limit from the LLaMA API. Please try again later, or check your API usage and limits.'
            }
          ]);
        } else {
          const data = await res.json();
          let text = "Sorry, I couldn't get an answer from the AI assistant.";
          if (data && data.text) {
            text = data.text;
          } else if (data.error) {
            text = `LLaMA API error: ${data.error}`;
          }
          setMessages(msgs => [...msgs, { sender: 'bot', text }]);
        }
      } catch (err) {
        setMessages(msgs => [...msgs, { sender: 'bot', text: "Sorry, I couldn't get an answer from the AI assistant." }]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 60px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <div className="card" style={{ maxWidth: 500, width: '100%', marginTop: 32 }}>
        <h2>AI Health Chatbot</h2>
        <div style={{ minHeight: 200, maxHeight: 300, overflowY: 'auto', marginBottom: 16, background: '#f9f9f9', borderRadius: 4, padding: 12 }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '8px 0' }}>
              <span style={{
                background: msg.sender === 'user' ? '#1976d2' : '#e2e3e5',
                color: msg.sender === 'user' ? '#fff' : '#222',
                padding: '8px 12px',
                borderRadius: 16,
                display: 'inline-block',
                maxWidth: '80%',
                wordBreak: 'break-word',
              }}>
                {msg.text}
              </span>
            </div>
          ))}
          {loading && (
            <div style={{ textAlign: 'left', margin: '8px 0' }}>
              <span style={{ background: '#e2e3e5', color: '#222', padding: '8px 12px', borderRadius: 16, display: 'inline-block' }}>
                <span className="dot-flashing" style={{ display: 'inline-block', width: 24 }}>
                  <span style={{ animation: 'dotFlashing 1s infinite linear alternate', fontSize: 20 }}>...</span>
                </span>
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a health question..."
            className="input input-dark"
            style={{ flex: 1 }}
            disabled={loading}
          />
          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
        <style>{`
          @keyframes dotFlashing {
            0% { opacity: 0.2; }
            50% { opacity: 1; }
            100% { opacity: 0.2; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Chatbot;
