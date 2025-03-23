"use client";

import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();

  return (
    <div>
      <Button onClick={() => router.push("/signin")} type="button">
        Sign In
      </Button>
    </div>
  );
}
