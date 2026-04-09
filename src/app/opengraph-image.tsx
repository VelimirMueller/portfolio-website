import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt =
  'Velimir Müller — Senior Product Engineer & AI Agentic Developer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090B',
          fontFamily: 'monospace',
          padding: '60px',
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            width: '120px',
            height: '4px',
            backgroundColor: '#A855F7',
            marginBottom: '40px',
            borderRadius: '2px',
          }}
        />

        {/* Name */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: '#FAFAFA',
            letterSpacing: '0.05em',
            lineHeight: 1.1,
            textAlign: 'center',
          }}
        >
          VELIMIR MÜLLER
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 400,
            color: '#A1A1AA',
            marginTop: '24px',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          Senior Product Engineer & AI Agentic Developer
        </div>

        {/* Tags row */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '40px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['Next.js', 'MCP Server', 'Claude Code', 'Full-Stack'].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  fontSize: '18px',
                  color: '#A855F7',
                  border: '1px solid #A855F7',
                  borderRadius: '9999px',
                  padding: '8px 20px',
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            width: '120px',
            height: '4px',
            backgroundColor: '#A855F7',
            marginTop: '40px',
            borderRadius: '2px',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
