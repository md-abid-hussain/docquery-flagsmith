import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { signOut } from "@/auth";

export default function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({
          redirectTo: "/d/chat",
        });
      }}
      className="w-full"
    >
      <Button type="submit" className="w-full">
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </Button>
    </form>
  );
}
