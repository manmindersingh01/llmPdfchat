import React from "react";
import SignIn from "~/components/discordLogin";

type Props = {};

function page({}: Props) {
  return (
    <div className="text-teal-600">
      <SignIn />
    </div>
  );
}

export default page;
