import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  throw new Error("Sentry setup test error - you can safely ignore this");
}
