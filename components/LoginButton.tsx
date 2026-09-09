"use client";

import { signIn } from "next-auth/react";

type LoginButtonProps = {
  callbackUrl: string;
};

export default function LoginButton({ callbackUrl }: LoginButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl })}
      className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      Googleでログイン
    </button>
  );
}
