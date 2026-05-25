import { useState, useEffect, useRef } from 'react'
import {
  collection, query, orderBy, onSnapshot,
  addDoc, serverTimestamp, doc, getDoc, updateDoc
} from 'firebase/firestore'
import { db } from '../firebase'
import './ChatRoom.css'

export default function ChatRoom({ currentUser, chatId, onBack }) {
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [otherUser, setOtherUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load info user lawan
  useEffect(() => {
    const loadChat = async () => {
      setLoading(true)
      try {
        const chatDoc = await getDoc(doc(db, 'chats', chatId))
        if (!chatDoc.exists()) { onBack ? onBack() : window.history.back(); return }
        const data = chatDoc.data()
        const otherId = data.members.find(id => id !== currentUser.uid)
        if (otherId) {
          const userDoc = await getDoc(doc(db, 'users', otherId))
          if (userDoc.exists()) setOtherUser(userDoc.data())
        }
      } catch (e) {}
      setLoading(false)
    }
    loadChat()
  }, [chatId, currentUser.uid])

  // Listen pesan real-time
  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [chatId])

  const sendMessage = async () => {
    const text = newMsg.trim()
    if (!text) return
    setNewMsg('')
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.phoneNumber || 'Aku',
        createdAt: serverTimestamp(),
        read: false
      })
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: text.length > 50 ? text.substring(0, 50) + '...' : text,
        updatedAt: serverTimestamp()
      })
    } catch (e) {
      console.error('Gagal kirim pesan:', e)
    }
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    const date = ts.toDate ? ts.toDate() : new Date(ts)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (ts) => {
    if (!ts) return ''
    const date = ts.toDate ? ts.toDate() : new Date(ts)
    const now = new Date()
    if (date.toDateString() === now.toDateString()) return 'Hari ini'
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) return 'Kemarin'
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const dateKey = msg.createdAt ? formatDate(msg.createdAt) : 'Baru saja'
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(msg)
    return groups
  }, {})

  if (loading) {
    return (
      <div className="chatroom-loading">
        <div className="spinner"/>
        <span>Memuat percakapan...</span>
      </div>
    )
  }

  return (
    <div className="chatroom">
      {/* HEADER */}
      <div className="chatroom-header">
        <button className="btn-back-chat" onClick={() => onBack ? onBack() : window.history.back()}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="chatroom-user-info">
          <div className="chatroom-avatar">
            {otherUser?.photoURL
              ? <img src={otherUser.photoURL} alt="" />
              : <span>{(otherUser?.displayName || '?')[0].toUpperCase()}</span>
            }
          </div>
          <div>
            <div className="chatroom-name">{otherUser?.displayName || otherUser?.phoneNumber || 'Pengguna'}</div>
            <div className="chatroom-status">
              <span className="status-dot"/>
              Aktif
            </div>
          </div>
        </div>
        <div className="chatroom-actions">
          <button className="btn-icon-chat" title="Telepon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
          </button>
          <button className="btn-icon-chat" title="Video Call">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="messages-empty">
            <div className="messages-empty-icon">👋</div>
            <p>Mulai percakapan!</p>
            <small>Kirim pesan pertamamu ke {otherUser?.displayName || 'pengguna ini'}</small>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="date-divider">
                <span>{date}</span>
              </div>
              {msgs.map((msg, i) => {
                const isMe = msg.senderId === currentUser.uid
                const prevMsg = msgs[i - 1]
                const isFirst = !prevMsg || prevMsg.senderId !== msg.senderId
                return (
                  <div key={msg.id} className={`message-row ${isMe ? 'me' : 'them'} ${isFirst ? 'first' : ''}`}>
                    {!isMe && isFirst && (
                      <div className="msg-avatar">
                        {otherUser?.photoURL
                          ? <img src={otherUser.photoURL} alt="" />
                          : <span>{(otherUser?.displayName || '?')[0].toUpperCase()}</span>
                        }
                      </div>
                    )}
                    {!isMe && !isFirst && <div className="msg-avatar-spacer"/>}
                    <div className={`message-bubble ${isMe ? 'bubble-out' : 'bubble-in'}`}>
                      <p>{msg.text}</p>
                      <span className="msg-time">
                        {formatTime(msg.createdAt)}
                        {isMe && (
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="read-check">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                          </svg>
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef}/>
      </div>

      {/* INPUT */}
      <div className="chat-input-area">
        <button className="btn-attach" title="Lampirkan file">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
          </svg>
        </button>
        <div className="chat-input-wrap">
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="Ketik pesan..."
            value={newMsg}
            onChange={e => {
              setNewMsg(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={handleKey}
          />
        </div>
        <button
          className={`btn-send ${newMsg.trim() ? 'active' : ''}`}
          onClick={sendMessage}
          disabled={!newMsg.trim()}
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
