import { useState } from 'react'
import {
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth'
import { auth } from '../firebase'
import './Login.css'

export default function Login() {
  const [mode, setMode] = useState('main') // 'main' | 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmResult, setConfirmResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loginWithGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err) {
      setError('Gagal login dengan Google. Coba lagi.')
      setLoading(false)
    }
  }

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
      })
    }
  }

  const sendOTP = async () => {
    if (!phone || phone.length < 8) {
      setError('Masukkan nomor telepon yang valid.')
      return
    }
    setLoading(true)
    setError('')
    try {
      setupRecaptcha()
      const appVerifier = window.recaptchaVerifier
      // Format: +62 untuk Indonesia, sesuaikan
      const fullPhone = phone.startsWith('+') ? phone : `+62${phone.replace(/^0/, '')}`
      const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier)
      setConfirmResult(result)
      setMode('otp')
    } catch (err) {
      setError('Gagal kirim OTP. Pastikan nomor valid dan coba lagi.')
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (!otp || otp.length < 6) {
      setError('Masukkan kode OTP 6 digit.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await confirmResult.confirm(otp)
    } catch (err) {
      setError('Kode OTP salah atau sudah kadaluarsa.')
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-orb orb1" />
        <div className="login-orb orb2" />
        <div className="login-grid" />
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="#00d9ff" strokeWidth="2"/>
              <path d="M14 24C14 18.477 18.477 14 24 14C29.523 14 34 18.477 34 24C34 26.5 33.1 28.8 31.6 30.6L34 36L28 34C26.8 34.6 25.4 35 24 35C18.477 35 14 30.523 14 25" stroke="#00d9ff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1>ChatApp</h1>
          <p>Pesan lintas negara, gratis & aman</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        {mode === 'main' && (
          <div className="login-options">
            <button className="btn-google" onClick={loginWithGoogle} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Memuat...' : 'Masuk dengan Google'}
            </button>

            <div className="login-divider"><span>atau</span></div>

            <button className="btn-phone" onClick={() => { setMode('phone'); setError('') }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              Masuk dengan Nomor HP
            </button>
          </div>
        )}

        {mode === 'phone' && (
          <div className="login-phone">
            <div className="input-group">
              <label>Nomor Telepon</label>
              <div className="phone-input-wrap">
                <span className="phone-flag">🇮🇩 +62</span>
                <input
                  type="tel"
                  placeholder="8xxxxxxxxxx"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendOTP()}
                  autoFocus
                />
              </div>
              <small>Masukkan nomor tanpa 0 di depan, atau gunakan format internasional (+62...)</small>
            </div>
            <div id="recaptcha-container" />
            <button className="btn-primary" onClick={sendOTP} disabled={loading}>
              {loading ? 'Mengirim OTP...' : 'Kirim Kode OTP'}
            </button>
            <button className="btn-back" onClick={() => { setMode('main'); setError('') }}>
              ← Kembali
            </button>
          </div>
        )}

        {mode === 'otp' && (
          <div className="login-otp">
            <p className="otp-desc">Kode OTP dikirim ke <strong>{phone}</strong></p>
            <div className="input-group">
              <label>Kode OTP</label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                onKeyDown={e => e.key === 'Enter' && verifyOTP()}
                className="otp-input"
                autoFocus
              />
            </div>
            <button className="btn-primary" onClick={verifyOTP} disabled={loading}>
              {loading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
            </button>
            <button className="btn-back" onClick={() => { setMode('phone'); setOtp(''); setError('') }}>
              ← Ganti Nomor
            </button>
          </div>
        )}

        <p className="login-footer">
          Dengan masuk, kamu setuju dengan kebijakan privasi dan ketentuan layanan.
        </p>
      </div>
    </div>
  )
}
