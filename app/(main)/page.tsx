import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconFolder, IconRobot, IconChecklist, IconFileAnalytics } from "@tabler/icons-react";
import Link from "next/link";
import { HomeAutoSync } from "./home-auto-sync";

export default async function HomePage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const features = [
    {
      title: "Projects Management",
      description: "Create and manage standalone projects or sync with Jira. Configure compliance requirements, track project status, and maintain centralized control over all your ALM testing initiatives.",
      icon: IconFolder,
      href: "/projects"
    },
    {
      title: "Test Case Generation",
      description: "Leverage AI to automatically generate comprehensive test cases from your requirements. Schedule bulk generation jobs, review AI-generated tests, and ensure complete coverage of your compliance scenarios.",
      icon: IconRobot,
      href: "/scheduler"
    },
    {
      title: "Compliance Matrix",
      description: "Visualize and track compliance requirements across all projects. Monitor adherence to ALM regulations, identify gaps in coverage, and ensure your testing meets all regulatory standards.",
      icon: IconChecklist,
      href: "/projects"
    },
    {
      title: "Analytics & Reports",
      description: "Access detailed insights on test generation progress, compliance status, and coverage metrics. Generate comprehensive reports for stakeholders and track your ALM testing effectiveness over time.",
      icon: IconFileAnalytics,
      href: "/scheduler"
    }
  ];

  return (
    <div className="px-4 lg:px-6">
      <HomeAutoSync />
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Welcome to Artificial ALM</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">Your AI-powered ALM compliance and test case generation platform</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Link key={feature.title} href={feature.href}>
            <Card className="h-full cursor-pointer relative overflow-hidden group">
              <CardHeader>
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
                  <CardTitle className="mb-0 text-base sm:text-lg">{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-sm">{feature.description}</CardDescription>
              </CardHeader>
              <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity px-4">
                <feature.icon className="h-10 w-10 sm:h-12 sm:w-12 mb-2 sm:mb-3" />
                <span className="text-base sm:text-lg font-semibold text-center">Go to {feature.title}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
