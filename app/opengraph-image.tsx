import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'TraduzSum - Simplificando o direito para todos'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #075985 0%, #0ea5e9 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Logo TS */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '50px',
          }}
        >
          <div
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '5px solid white',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div
              style={{
                fontSize: '56px',
                fontWeight: '900',
                color: 'white',
                lineHeight: '1',
                marginBottom: '6px',
                letterSpacing: '-2px',
              }}
            >
              T
            </div>
            <div
              style={{
                fontSize: '56px',
                fontWeight: '900',
                color: 'white',
                lineHeight: '1',
                letterSpacing: '-2px',
              }}
            >
              S
            </div>
          </div>
        </div>

        {/* Nome da empresa */}
        <div
          style={{
            fontSize: '80px',
            fontWeight: '900',
            color: 'white',
            marginBottom: '24px',
            textAlign: 'center',
            letterSpacing: '-3px',
          }}
        >
          TraduzSum
        </div>

        {/* Subtítulo */}
        <div
          style={{
            fontSize: '36px',
            color: 'rgba(255, 255, 255, 0.95)',
            textAlign: 'center',
            maxWidth: '1000px',
            fontWeight: '500',
          }}
        >
          Simplificando o direito para todos
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

