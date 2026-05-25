import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import {
  collection, query, where, onSnapshot,
  addDoc, serverTimestamp, doc, setDoc, getDoc, getDocs, orderBy
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import ChatRoom from './ChatRoom'
import './MainApp.css'

export default function MainApp({ user }) {
  const [contacts, setContacts] = useState([])
  const [chats, setChats] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [activeTab, setActiveTab] = useState('chats')
  const [showProfile, setShowProfile] = useState(false)
  const navigate = useNavigate()

  // Simpan user ke Firestore saat pertama login
  useEffect(() => {
    const saveUser = async () => {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: user.displayName || user.phoneNumber || 'Pengguna',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        photoURL: user.photoURL || '',
        lastSeen: serverTimestamp(),
        createdAt: serverTimestamp()
      }, { merge: true })
    }
    saveUser()
  }, [user])

  // Load daftar chat
  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      where('members', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    )
    const unsub = onSnapshot(q, async (snapshot) => {
      const chatList = await Promise.all(snapshot.docs.map(async (d) => {
        const data = d.data()
        const otherId = data.members.find(id => id !== user.uid)
        let otherUser = { displayName: 'Unknown', photoURL: '' }
        if (otherId) {
          const userDoc = await getDoc(doc(db, 'users', otherId))
          if (userDoc.exists()) otherUser = userDoc.data()
        }
        return {
          id: d.id,
          ...data,
          otherUser,
          otherId
        }
      }))
      setChats(chatList)
    })
    return () => unsub()
  }, [user.uid])

  // Cari user berdasarkan email atau nama
  const searchUsers = async (q) => {
    if (!q.trim()) { setSearchResults([]); return }
    const usersRef = collection(db, 'users')
    const snap = await getDocs(usersRef)
    const results = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u =>
        u.uid !== user.uid &&
        (
          u.displayName?.toLowerCase().includes(q.toLowerCase()) ||
          u.email?.toLowerCase().includes(q.toLowerCase())
        )
      )
    setSearchResults(results)
  }

  // Buka atau buat chat baru dengan user lain
  const openChat = async (otherUser) => {
    const members = [user.uid, otherUser.uid].sort()
    const chatId = members.join('_')
    const chatRef = doc(db, 'chats', chatId)
    const chatDoc = await getDoc(chatRef)
    if (!chatDoc.exists()) {
      await setDoc(chatRef, {
        members,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: ''
      })
    }
    setSearchQuery('')
    setSearchResults([])
    navigate(`/chat/${chatId}`)
  }

const openExistingChat = (chatId) => {
  navigate(`/chat/${chatId}`)
  if (window.innerWidth <= 768) {
    document.querySelector('.sidebar').classList.add('hidden')
  }
}

  const handleLogout = async () => {
    await signOut(auth)
  }

  const avatar = (u) => u?.photoURL
    ? <img src={u.photoURL} alt="" className="avatar-img" />
    : <div className="avatar-placeholder">{(u?.displayName || '?')[0].toUpperCase()}</div>

  const formatTime = (ts) => {
    if (!ts) return ''
    const date = ts.toDate ? ts.toDate() : new Date(ts)
    const now = new Date()
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="main-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="#00d9ff" strokeWidth="2.5"/>
              <path d="M14 24C14 18.477 18.477 14 24 14C29.523 14 34 18.477 34 24C34 26.5 33.1 28.8 31.6 30.6L34 36L28 34C26.8 34.6 25.4 35 24 35C18.477 35 14 30.523 14 25" stroke="#00d9ff" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span>ChatApp</span>
          </div>
          <button className="btn-icon" onClick={() => setShowProfile(p => !p)} title="Profil">
            <div className="user-avatar-small">
              {user.photoURL
                ? <img src={user.photoURL} alt="" />
                : (user.displayName || '?')[0].toUpperCase()
              }
            </div>
          </button>
        </div>

        {showProfile && (
          <div className="profile-dropdown">
            <div className="profile-info">
              <div className="profile-avatar">
                {user.photoURL
                  ? <img src={user.photoURL} alt="" />
                  : (user.displayName || '?')[0].toUpperCase()
                }
              </div>
              <div>
                <strong>{user.displayName || user.phoneNumber || 'Pengguna'}</strong>
                <small>{user.email || user.phoneNumber || ''}</small>
              </div>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Keluar
            </button>
          </div>
        )}

        <div className="search-box">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="search-icon">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Cari pengguna atau chat..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); searchUsers(e.target.value) }}
          />
        </div>

        {searchResults.length > 0 && (
          <div className="search-results">
            <div className="section-label">Hasil Pencarian</div>
            {searchResults.map(u => (
              <div key={u.uid} className="chat-item" onClick={() => openChat(u)}>
                <div className="chat-avatar">{avatar(u)}</div>
                <div className="chat-info">
                  <span className="chat-name">{u.displayName}</span>
                  <span className="chat-preview">{u.email || u.phoneNumber}</span>
                </div>
                <div className="chat-new-badge">Baru</div>
              </div>
            ))}
          </div>
        )}

        <div className="chat-tabs">
          <button className={activeTab === 'chats' ? 'tab active' : 'tab'} onClick={() => setActiveTab('chats')}>
            Pesan
          </button>
        </div>

        <div className="chat-list">
          {chats.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <p>Belum ada pesan</p>
              <small>Cari pengguna di atas untuk mulai chat</small>
            </div>
          ) : (
            chats.map(chat => (
              <div
                key={chat.id}
                className="chat-item"
                onClick={() => openExistingChat(chat.id)}
              >
                <div className="chat-avatar">{avatar(chat.otherUser)}</div>
                <div className="chat-info">
                  <span className="chat-name">{chat.otherUser?.displayName || 'Pengguna'}</span>
                  <span className="chat-preview">{chat.lastMessage || 'Mulai percakapan...'}</span>
                </div>
                <div className="chat-meta">
                  <span className="chat-time">{formatTime(chat.updatedAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* AREA CHAT */}
      <main className="chat-area">
        <Routes>
          <Route path="/" element={
            <div className="chat-welcome">
              <div className="welcome-icon">
                <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" stroke="#00d9ff" strokeWidth="1.5" opacity="0.5"/>
                  <path d="M14 24C14 18.477 18.477 14 24 14C29.523 14 34 18.477 34 24C34 26.5 33.1 28.8 31.6 30.6L34 36L28 34C26.8 34.6 25.4 35 24 35C18.477 35 14 30.523 14 25" stroke="#00d9ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                </svg>
              </div>
              <h2>Selamat datang di ChatApp</h2>
              <p>Pilih percakapan atau cari pengguna baru untuk mulai chat lintas negara</p>
            </div>
          } />
          <Route path="/chat/:chatId" element={<ChatRoom currentUser={user} />} />
        </Routes>
      </main>
    </div>
  )
}
