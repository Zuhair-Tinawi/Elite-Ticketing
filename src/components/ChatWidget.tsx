import { useRef, useState } from 'react';

// Public address of our backend proxy (the elite-ticketing-chat-api
// project on Vercel). This URL isn't secret — the real secret (the
// Gemini key) lives only on the server and never comes near this file.
const CHAT_API_URL = 'https://elite-ticketing-chat-api.vercel.app/api/chat';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: "Hi! Ask me anything about using Elite Ticketing — buying tickets, points, QR codes, and so on." },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const reply = res.ok ? data.reply : 'Sorry, something went wrong. Try again in a moment.';
      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: "Sorry, I couldn't reach the chat service. Check your connection and try again." },
      ]);
    } finally {
      setSending(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') sendMessage();
  }

  return (
    <>
      {open && (
        <div
          className="card"
          style={{
            position: 'fixed',
            bottom: 90,
            left: 20,
            width: 320,
            maxWidth: 'calc(100vw - 40px)',
            height: 420,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <strong>Site Assistant</strong>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 10, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius)',
                    background: m.role === 'user' ? 'var(--color-surface-alt)' : 'transparent',
                    border: m.role === 'bot' ? '1px solid var(--color-border)' : 'none',
                    maxWidth: '85%',
                  }}
                >
                  {m.text}
                </span>
              </div>
            ))}
            {sending && <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Thinking…</p>}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--color-border)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question…"
              style={{ flex: 1, padding: '8px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}
            />
            <button className="btn" onClick={sendMessage} disabled={sending}>
              Send
            </button>
          </div>
        </div>
      )}

      <button
        className="btn"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: 70,
          left: 20,
          width: 56,
          height: 56,
          borderRadius: '50%',
          padding: 0,
          fontSize: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        aria-label="Open chat assistant"
      >
        {open ? '×' : '💬'}
      </button>
    </>
  );
}