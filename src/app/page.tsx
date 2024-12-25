import React from "react";
import SignIn from "~/components/discordLogin";
import DotPattern from "~/components/ui/dot-pattern";

import SparklesText from "~/components/ui/sparkles-text";
import { cn } from "~/lib/utils";

function page() {
  return (
    <div className="h-screen w-full bg-yellow-50">
      <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg">
        <p className="z-10 mb-40 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-black dark:text-white">
          <SparklesText text="Never let anyone spoil your cheating" />
        </p>
        <SignIn />
        <DotPattern
          className={cn(
            "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]",
          )}
        />
      </div>
    </div>
  );
}

export default page;
