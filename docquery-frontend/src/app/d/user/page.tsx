import { auth } from "@/auth";
import { UserProfile } from "@/components/user/user-profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Profile | DocQuery",
  description: "View and manage your profile details",
};

export default async function ProfilePage() {
  const session = await auth();

  return <UserProfile user={session?.user} />;
}
