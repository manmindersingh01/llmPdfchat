import { type NextRequest } from "next/server";
import { db } from "~/server/db";
interface RequestBody {
  chatSessionId: string; // Update the type if `chatSessionId` is not a string
}
export async function POST(request: NextRequest) {
  const { chatSessionId }: RequestBody = await request.json();
  const res = await db.message.findMany({
    where: {
      chatSessionId,
    },
  });
  return new Response(JSON.stringify(res));
}
