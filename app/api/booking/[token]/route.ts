import { NextResponse, connection } from "next/server";
import { openDays } from "@/content/booking";
import {
  cancellationToVisitor,
  confirmToVisitor,
  notifyStudio,
} from "@/lib/booking-emails";
import { bookingStore, type Booking, type BookingStore } from "@/lib/booking-store";
import { createToken, hashToken, isToken } from "@/lib/booking-token";
import { mailer } from "@/lib/email";
import { throttle } from "@/lib/throttle";

/**
 * One booking, reached through the private link in its emails: read it, move
 * it to another free slot, or cancel it.
 */

const throttled = throttle(10);

async function load(token: string) {
  const store = await bookingStore();
  if (!store || !isToken(token)) return { store, booking: null };
  return { store, booking: await store.find(await hashToken(token)) };
}

const isPast = (b: Booking) => new Date(b.slot).getTime() <= Date.now();

/** Where it can move to: the free days, its own day included, minus its own slot. */
async function destinations(store: BookingStore, b: Booking) {
  const days = openDays();
  const taken = await store.taken(days.map((d) => d.date));
  return days
    .filter((d) => d.date === b.date || !taken.has(d.date))
    .map((d) =>
      d.date === b.date ? { ...d, slots: d.slots.filter((s) => s !== b.slot) } : d,
    )
    .filter((d) => d.slots.length > 0);
}

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/booking/[token]">,
) {
  await connection();
  const { token } = await ctx.params;
  const { store, booking } = await load(token);
  if (!store || !booking) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const past = isPast(booking);
  return NextResponse.json({
    booking: { slot: booking.slot, name: booking.name, past },
    days: past ? [] : await destinations(store, booking),
  });
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/booking/[token]">,
) {
  if (throttled(request)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const { token } = await ctx.params;
  const { store, booking } = await load(token);
  if (!store || !booking) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (isPast(booking)) {
    return NextResponse.json({ error: "past" }, { status: 409 });
  }

  const mail = mailer();
  if (!mail) {
    console.error("Booking changes need RESEND_API_KEY and CONTACT_TO_EMAIL");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  if (body.action === "cancel") {
    await store.release(booking.date);
    try {
      await notifyStudio(mail, "cancelled", booking);
    } catch (cause) {
      console.error("Booking: the cancellation notice to the studio failed", cause);
    }
    try {
      await cancellationToVisitor(mail, booking);
    } catch (cause) {
      console.error("Booking: the cancellation to the visitor failed", cause);
    }
    return NextResponse.json({ ok: true });
  }

  if (body.action === "move") {
    const slot = String(body.slot ?? "");
    const day = (await destinations(store, booking)).find((d) => d.slots.includes(slot));
    if (!day) return NextResponse.json({ error: "taken" }, { status: 409 });

    // A fresh link for the new time; the old one stops working.
    const next = createToken();
    const moved: Booking = {
      ...booking,
      date: day.date,
      slot,
      sequence: booking.sequence + 1,
      tokenHash: await hashToken(next),
    };
    if (!(await store.move(booking.date, moved))) {
      return NextResponse.json({ error: "taken" }, { status: 409 });
    }
    try {
      await notifyStudio(mail, "moved", moved, booking);
    } catch (cause) {
      console.error("Booking: the move notice to the studio failed", cause);
    }
    try {
      await confirmToVisitor(mail, moved, next, "moved");
    } catch (cause) {
      console.error("Booking: the new confirmation to the visitor failed", cause);
    }
    return NextResponse.json({ ok: true, token: next });
  }

  return NextResponse.json({ error: "bad_request" }, { status: 400 });
}
