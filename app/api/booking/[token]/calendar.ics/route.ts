import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { calendarFile } from "@/lib/booking-emails";
import { bookingStore } from "@/lib/booking-store";
import { hashToken, isToken } from "@/lib/booking-token";

/**
 * The booking as a calendar file, behind the "Apple Calendar" button in the
 * confirmation: opened on an iPhone or a Mac, it offers to add the call to
 * Calendar. It always describes the booking as it is now.
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/booking/[token]/calendar.ics">,
) {
  await connection();
  const { token } = await ctx.params;
  const store = await bookingStore();
  const booking =
    store && isToken(token) ? await store.find(await hashToken(token)) : null;
  if (!booking) return new Response("Not found", { status: 404 });

  const t = await getTranslations({ locale: booking.locale, namespace: "booking.email" });
  return new Response(calendarFile(booking, t("summary"), t("meet")), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="breadegg-call.ics"',
      "Cache-Control": "no-store",
    },
  });
}
