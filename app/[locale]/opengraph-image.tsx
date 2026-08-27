import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BreadEgg · AI Product Studio";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** The share card is the mark and the promise. Nothing else. */
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 72,
          padding: "0 88px",
          background: "#2a1a0f",
        }}
      >
        <div
          style={{
            width: 260,
            height: 260,
            borderRadius: 9999,
            flexShrink: 0,
            background:
              "radial-gradient(circle at 35% 32%, #fff7d4 0%, #ffeaa4 10%, #fcd063 26%, #f8ab2a 48%, #f4901c 66%, #ea7a12 84%, #dd660a 100%)",
          }}
        />
        {/* 1200 − 176 padding − 260 egg − 72 gap leaves 692. German needs it all. */}
        <div style={{ display: "flex", flexDirection: "column", width: 692 }}>
          <div
            style={{
              fontSize: 24,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#a89685",
            }}
          >
            BreadEgg
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 52,
              lineHeight: 1.1,
              letterSpacing: -1.8,
              color: "#f7f1e8",
            }}
          >
            {t("title")}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
