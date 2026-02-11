import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title') || 'PokeShows';
  const subtitle = searchParams.get('subtitle') || 'Find Pokemon Card Shows Near You';
  const type = searchParams.get('type') || 'default';

  const YELLOW = '#FFCB05';
  const DARK_BG = '#1a1a2e';
  const DARK_SURFACE = '#16213e';

  const typeLabel =
    type === 'show'
      ? 'Card Show'
      : type === 'state'
        ? 'State Directory'
        : type === 'card'
          ? 'Card of the Day'
          : null;

  // SVG icon paths for each type
  const iconMap: Record<string, string> = {
    // Calendar icon
    show: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    // Map pin icon
    state:
      'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    // Card/rectangle icon
    card: 'M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z M8 10h8 M8 14h4',
  };

  const iconPath = iconMap[type];

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: DARK_BG,
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: `linear-gradient(90deg, ${YELLOW}, #E5B800, ${YELLOW})`,
          }}
        />

        {/* Background decorative circle */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255, 203, 5, 0.05)',
          }}
        />

        {/* Main content area */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            padding: '60px 80px',
          }}
        >
          {/* Type badge with icon */}
          {typeLabel && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 28,
              }}
            >
              {iconPath && (
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={YELLOW}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={iconPath} />
                </svg>
              )}
              <div
                style={{
                  display: 'flex',
                  fontSize: 18,
                  fontWeight: 600,
                  color: YELLOW,
                  border: `2px solid ${YELLOW}`,
                  borderRadius: 999,
                  padding: '6px 24px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                {typeLabel}
              </div>
            </div>
          )}

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 50 ? 42 : title.length > 30 ? 52 : 64,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              maxWidth: 950,
              marginBottom: 20,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div
              style={{
                fontSize: 26,
                color: '#9ca3af',
                maxWidth: 750,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 80px 40px',
          }}
        >
          {/* Branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: YELLOW,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 800,
                color: DARK_BG,
              }}
            >
              P
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: YELLOW,
                letterSpacing: '-0.01em',
              }}
            >
              PokeShows
            </div>
          </div>

          {/* URL */}
          <div
            style={{
              fontSize: 18,
              color: '#6b7280',
            }}
          >
            pokeshows.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
