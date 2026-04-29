import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function ActivatePage() {
  const router = useRouter()
  const { token } = router.query
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your activation link...')

  useEffect(() => {
    if (!token) {
      return
    }

    const tokenValue = Array.isArray(token) ? token[0] : token

    const verifyActivation = async () => {
      try {
        const response = await fetch(`/api/auth/activate/${tokenValue}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data?.message || 'Activation failed')
        }

        setStatus('success')
        setMessage(data.message || 'Your account has been activated successfully. Redirecting to login...')

        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } catch (error: any) {
        console.error('Activation error:', error)
        setStatus('error')
        setMessage(error?.message || 'Activation failed. Please try again.')
      }
    }

    verifyActivation()
  }, [token, router])

  return (
    <>
      <Head>
        <title>Activate Account - Airswift</title>
        <meta name="description" content="Activate your Airswift account" />
      </Head>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '520px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
          padding: '36px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ margin: 0, fontSize: '32px', color: '#111' }}>Airswift</h1>
            <p style={{ margin: '10px 0 0', color: '#666', fontSize: '16px' }}>
              Activating your account now...
            </p>
          </div>

          {status === 'loading' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-block',
                width: '44px',
                height: '44px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '20px',
              }} />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              <p style={{ color: '#444', fontSize: '15px' }}>{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div style={{
              background: '#ddf7e5',
              border: '1px solid #b7e4c7',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '14px' }}>✅</div>
              <h2 style={{ margin: '0 0 14px', fontSize: '22px', color: '#1f3d32' }}>Account Activated</h2>
              <p style={{ margin: 0, color: '#27533f', fontSize: '15px', lineHeight: '1.6' }}>{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '14px' }}>⚠️</div>
              <h2 style={{ margin: '0 0 14px', fontSize: '22px', color: '#991b1b' }}>Activation Failed</h2>
              <p style={{ margin: 0, color: '#7f1d1d', fontSize: '15px', lineHeight: '1.6' }}>{message}</p>
            </div>
          )}

          {status !== 'loading' && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link href="/login">
                <a style={{
                  display: 'inline-block',
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}>
                  Back to login
                </a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
