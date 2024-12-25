import { type NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "~/server/db";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
interface Message {
  role: "user" | "model";
  content: string;
}
interface RequestBody {
  messages: Message[];
  userId: string;
}
export async function POST(request: NextRequest) {
  try {
    const { messages, userId }: RequestBody = await request.json();

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
      });
    }

    // Get the last message which is the latest user input
    const lastMessage = messages[messages.length - 1];

    // Create or get chat session
    let chatSession = await db.chatSession.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!chatSession) {
      chatSession = await db.chatSession.create({
        data: {
          userId,
          title: "new chat session",
        },
      });
    }

    // Format history for Gemini
    //@ts-ignore
    const formattedHistory = messages.slice(0, -1).map((msg: Message) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Initialize chat with history
    const chat = model.startChat({
      history: formattedHistory,
    });

    // Set up streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send message and get stream
          //@ts-ignore
          const result = await chat.sendMessageStream(lastMessage.content);
          let fullResponse = "";

          // Process stream chunks
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            controller.enqueue(encoder.encode(chunkText));
          }

          // Save to database after streaming completes
          await db.message.createMany({
            data: [
              {
                chatSessionId: chatSession.id,
                sender: "user",
                //@ts-ignore
                content: lastMessage.content,
              },
              {
                chatSessionId: chatSession.id,
                sender: "model",
                content: fullResponse,
              },
            ],
          });

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
