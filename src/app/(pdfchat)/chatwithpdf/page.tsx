"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { SendIcon, LoaderIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useAuthStore } from "~/lib/store";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
//@ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
//@ts-ignore
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
type Message = {
  role: "user" | "assistant";
  content: string;
};

const PdfChat = () => {
  const { userId, setUserId } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        if (data?.userId) {
          setUserId(data.userId);
        }
      } catch (error) {
        console.error("Error fetching user session:", error);
      }
    };
    fetchUserSession();
  }, [setUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    //@ts-ignore
    if (!input.trim() ?? isLoading) return;

    setIsLoading(true);
    const userMessage = { role: "user" as const, content: input };

    // Add user message once
    setMessages((prev) => [...prev, userMessage]);

    // Create initial assistant message
    const assistantMessage = { role: "assistant" as const, content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    setInput("");

    try {
      const response = await fetch("/api/chat2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userId,
        }),
      });

      if (!response.ok) throw new Error(response.statusText);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);

          // Update only the assistant's message content
          setMessages((prev) => {
            const newMessages = [...prev];
            //@ts-ignore
            newMessages[newMessages.length - 1].content += chunk;
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally show error message to user
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex h-screen w-full items-center justify-center">
      <div className="">
        <ScrollArea className="h-[500px] w-full max-w-full p-4">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <div
                key={index}
                className={`my-2 ${
                  message.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`mx-w-[600px] inline-block rounded-lg p-2 ${
                    message.role === "user"
                      ? "bg-primary text-white"
                      : "bg-secondary"
                  }`}
                >
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      //@ts-ignore
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className ?? "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            //@ts-ignore
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code
                            className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-800"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      },
                      ul: ({ children }) => (
                        <ul className="ml-6 list-disc space-y-1 text-gray-800">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="ml-6 list-decimal space-y-1 text-gray-800">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="ml-4 pl-2 text-gray-800">{children}</li>
                      ),
                      p: ({ children }) => (
                        <p className="mb-2 leading-relaxed text-gray-800">
                          {children}
                        </p>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="ml-4 border-l-4 border-gray-300 pl-4 italic text-gray-600">
                          {children}
                        </blockquote>
                      ),
                      h1: ({ children }) => (
                        <h1 className="mb-2 text-2xl font-bold text-gray-800">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="mb-2 text-xl font-semibold text-gray-700">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="mb-2 text-lg font-medium text-gray-600">
                          {children}
                        </h3>
                      ),
                    }}
                  >
                    {message.content}
                  </Markdown>
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-full w-full items-center justify-center p-10">
              <p>Hi, I'm a bot. How can I assist you today?</p>
            </div>
          )}
          <div ref={scrollRef} />
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
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="hover:bg-black"
              disabled={isLoading}
            >
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

export default PdfChat;
