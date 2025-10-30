import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  return (
    <div className="px-4 lg:px-6">
      <h1 className="text-2xl font-bold">Home</h1>
      <p className="text-muted-foreground mt-2">Welcome to Artificial AML</p>
    </div>
  );
}
