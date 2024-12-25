import { NextRequest } from "next/server";
import { db } from "~/server/db";

export async function POST(request: NextRequest) {
  const { chatSessionId } = await request.json();
  const res = await db.message.findMany({
    where: {
      chatSessionId,
    },
  });
  return new Response(JSON.stringify(res));
}
