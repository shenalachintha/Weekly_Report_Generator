import React, { useState } from 'react';
import { api } from '../api';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Lightbulb, 
  RefreshCw 
} from 'lucide-react';

export const AiAssistantDrawer = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am your Team Activity & Reporting AI Assistant. You can ask me about weekly progress, current blockers, deliverable status, or workload distributions across team members.',
      highlights: ['Alice Chen (Checkout UI)', 'Bob Miller (K8s v1.28)', 'Diana Prince (Playwright Tests)'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  if (!isOpen) return null;

  const handleSend = async (customPrompt) => {
    const queryText = customPrompt || inputPrompt;
    if (!queryText.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await api.ai.query(queryText);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.response,
        highlights: res.highlights || [],
        relevantReports: res.relevantReports || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'Sorry, I encountered an issue analyzing team data: ' + (err.message || 'Unknown error'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const summary = await api.ai.getSummary();
      setSummaryData(summary);
      const summaryMsg = {
        id: Date.now(),
        sender: 'ai',
        text: summary.executiveSummary,
        highlights: summary.keyAchievements,
        recommendations: summary.recommendedActions,
        blockers: summary.criticalBlockers,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, summaryMsg]);
    } catch (err) {
      alert('Error fetching AI team summary: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)'
    }}>
      <div 
        style={{
          width: '100%',
          maxWidth: 460,
          height: '100%',
          backgroundColor: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.25s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(139, 92, 246, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                Team AI Assistant
              </div>
              <div style={{ fontSize: '0.72rem', color: '#a78bfa' }}>
                Instant report intelligence & summaries
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          backgroundColor: 'rgba(0,0,0,0.2)'
        }}>
          <button
            onClick={handleGenerateSummary}
            className="btn btn-sm btn-ghost"
            style={{
              fontSize: '0.75rem',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: '#c4b5fd',
              whiteSpace: 'nowrap'
            }}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Weekly Summary
          </button>
          <button
            onClick={() => handleSend('Who has active blockers this week?')}
            className="btn btn-sm btn-ghost"
            style={{ fontSize: '0.75rem', border: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}
          >
            Open Blockers
          </button>
          <button
            onClick={() => handleSend('What did Alice Chen accomplish?')}
            className="btn btn-sm btn-ghost"
            style={{ fontSize: '0.75rem', border: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}
          >
            Alice's Progress
          </button>
        </div>

        {/* Chat Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}>
          {messages.map(msg => (
            <div 
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '92%',
                backgroundColor: msg.sender === 'user' ? '#2563eb' : 'var(--bg-panel)',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                color: '#fff',
                fontSize: '0.88rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 4,
                  fontSize: '0.72rem',
                  color: msg.sender === 'user' ? '#bfdbfe' : '#9ca3af'
                }}>
                  {msg.sender === 'user' ? <User size={12} /> : <Bot size={12} color="#a78bfa" />}
                  <span>{msg.sender === 'user' ? 'You' : 'AI Assistant'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                  {msg.text}
                </div>

                {msg.highlights && msg.highlights.length > 0 && (
                  <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#93c5fd', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={12} /> Key Highlights
                    </div>
                    {msg.highlights.map((h, idx) => (
                      <div key={idx} style={{ fontSize: '0.78rem', color: '#e5e7eb', marginBottom: 3, display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                        <span style={{ color: '#60a5fa' }}>•</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                )}

                {msg.blockers && msg.blockers.length > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f87171', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertTriangle size={12} /> Critical Blockers
                    </div>
                    {msg.blockers.map((b, idx) => (
                      <div key={idx} style={{ fontSize: '0.78rem', color: '#fca5a5', marginBottom: 3 }}>
                        • {b}
                      </div>
                    ))}
                  </div>
                )}

                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fbbf24', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Lightbulb size={12} /> Suggested Manager Actions
                    </div>
                    {msg.recommendations.map((r, idx) => (
                      <div key={idx} style={{ fontSize: '0.78rem', color: '#fef3c7', marginBottom: 3 }}>
                        • {r}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a78bfa', fontSize: '0.8rem', padding: 8 }}>
              <Bot size={16} className="animate-spin" />
              <span>Analyzing reports and generating intelligence...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: 8,
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ask about team activity, blockers, tasks..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputPrompt.trim()}
            className="btn btn-primary"
            style={{ padding: '0 14px' }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
