import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ManageBooking from "@/components/ui/ManageBooking";

type Props = {
  params: Promise<{ locale: string; token: string }>;
  searchParams: Promise<{ action?: string }>;
};

// A private page: the link in someone's email, never a search result.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "manage" });
  return { title: t("meta"), robots: { index: false, follow: false } };
}

/** Where the visitor moves or cancels their call, from the links in its emails. */
export default async function ManageBookingPage({ params, searchParams }: Props) {
  const { locale, token } = await params;
  const { action } = await searchParams;
  setRequestLocale(locale);

  return (
    <section className="relative px-6 pt-[clamp(8rem,18vh,11rem)] pb-[clamp(5rem,12vh,9rem)]">
      <div
        aria-hidden="true"
        className="egg-glow pointer-events-none absolute -top-1/3 left-1/2 h-[60vh] w-[110vw] -translate-x-1/2 rounded-[50%] opacity-40"
      />
      <div className="relative mx-auto max-w-3xl">
        <ManageBooking
          token={token}
          startWith={action === "cancel" ? "cancel" : "view"}
        />
      </div>
    </section>
  );
}
