import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "What My Pet Thinks — Find out what your pet would text you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  const bubbles = [
    { sender: "pet", text: "i ate the remote" },
    { sender: "owner", text: "You WHAT" },
    { sender: "pet", text: "it was looking at me weird" },
    { sender: "owner", text: "That's a $50 remote" },
    { sender: "pet", text: "it tasted like $12 tops" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
          padding: "0",
        }}
      >
        {/* Left side — branding + hook */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "480px",
            padding: "48px 40px 48px 56px",
          }}
        >
          {/* Paw emoji + brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "36px" }}>🐾</span>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "-0.5px",
              }}
            >
              What My Pet Thinks
            </span>
          </div>

          {/* Main headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "28px",
            }}
          >
            <span
              style={{
                fontSize: "52px",
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: 1.15,
                letterSpacing: "-1px",
              }}
            >
              What would
            </span>
            <span
              style={{
                fontSize: "52px",
                fontWeight: 800,
                color: "#FFFFFF",
                lineHeight: 1.15,
                letterSpacing: "-1px",
              }}
            >
              your pet
            </span>
            <span
              style={{
                fontSize: "52px",
                fontWeight: 800,
                color: "#FF6B4A",
                lineHeight: 1.15,
                letterSpacing: "-1px",
              }}
            >
              text you?
            </span>
          </div>

          {/* Subtext */}
          <span
            style={{
              fontSize: "20px",
              color: "rgba(255,255,255,0.5)",
              marginTop: "20px",
              lineHeight: 1.5,
            }}
          >
            Upload a photo. Get the conversation.
          </span>

          {/* URL pill */}
          <div
            style={{
              display: "flex",
              marginTop: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                background: "#FF6B4A",
                borderRadius: "24px",
                padding: "10px 24px",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                }}
              >
                Try it free → whatmypetthinks.com
              </span>
            </div>
          </div>
        </div>

        {/* Right side — iMessage conversation mockup */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "36px 48px 36px 24px",
            justifyContent: "center",
          }}
        >
          {/* Phone frame */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#FFFFFF",
              borderRadius: "32px",
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
            }}
          >
            {/* Mini header */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "20px 24px 14px",
                background: "linear-gradient(to bottom, #1A1A2E, #16213E)",
              }}
            >
              {/* Pet avatar circle */}
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "26px",
                  background: "linear-gradient(135deg, #FF6B4A, #E0452A)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "28px" }}>🐕</span>
              </div>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  marginTop: "6px",
                }}
              >
                Biscuit
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                iMessage
              </span>
            </div>

            {/* Messages */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "16px 20px 24px",
                gap: "8px",
              }}
            >
              {bubbles.map((msg, i) => {
                const isOwner = msg.sender === "owner";
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: isOwner ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        background: isOwner ? "#007AFF" : "#E9E9EB",
                        color: isOwner ? "#FFFFFF" : "#000000",
                        borderRadius: "18px",
                        padding: "10px 16px",
                        fontSize: "17px",
                        maxWidth: "80%",
                        lineHeight: 1.35,
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
