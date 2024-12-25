"use client";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import axios from "axios";
import { SendIcon, LoaderIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useAuthStore } from "~/lib/store";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
type Message = {
  sender: "user" | "model";
  content: string;
};
const TextChat = () => {
  const { userId, setUserId } = useAuthStore();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Fetch user session
  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await axios.get("/api/auth/session");
        if (response.data?.userId) {
          setUserId(response.data.userId);
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
      }
    };
    fetchUserSession();
  }, [setUserId]);

  // Auto-scroll to the bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading spinner

    try {
      const response = await axios.post(
        "/api/chat",
        { prompt: input, userId, chatSessionId },
        { headers: { "Content-Type": "application/json" } },
      );
      setChatSessionId(response.data.chatSessionId);
      //@ts-ignore
      setMessages((prev) => [
        ...prev,
        { sender: "user", content: input },
        { sender: "bot", content: response.data.response },
      ]);
      setInput("");
    } catch (error) {
      console.error("Error from API:", error);
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
  };

  return (
    <div className="bg-background flex h-screen w-full items-center justify-center">
      <div className="">
        <ScrollArea className="h-[500px] w-full p-4">
          {messages.length > 0 ? (
            messages.map((message: Message, index) => (
              <div
                key={index}
                className={`my-2 ${message.sender === "user" ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block rounded-lg p-2 ${message.sender === "user" ? "bg-primary text-white" : "bg-secondary"}`}
                >
                  {" "}
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    children={message.content}
                    components={{
                      //@ts-ignore
                      code({ node, inline, children, ...props }) {
                        return inline ? (
                          <code
                            {...props}
                            className="rounded-md bg-gray-200 px-1 text-sm"
                          >
                            {children}
                          </code>
                        ) : (
                          //@ts-ignore
                          <pre
                            {...props}
                            className="rounded-md bg-gray-200 p-1 text-sm"
                          >
                            {children}
                          </pre>
                        );
                      },
                      ul: ({ children }) => {
                        return <ul className="ml-4 list-disc">{children}</ul>;
                      },
                      li: ({ children }) => {
                        return <li className="ml-4 list-disc">{children}</li>;
                      },
                      ol: ({ children }) => {
                        return (
                          <ol className="ml-4 list-decimal">{children}</ol>
                        );
                      },
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-full w-full items-center justify-center p-10">
              <p>Hi, I'm a bot. How can I assist you today?</p>
            </div>
          )}
          <div ref={scrollRef}></div>
        </ScrollArea>
        <div className="bg-ba rounded-lg p-2">
          <form
            onSubmit={handleSubmit}
            className="flex items-center justify-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message"
            />
            <Button type="submit" className="hover:bg-black">
              {isLoading ? (
                <LoaderIcon className="animate-spin" />
              ) : (
                <SendIcon />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TextChat;
