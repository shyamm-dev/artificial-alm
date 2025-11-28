import { getServerSession } from "@/lib/get-server-session";
import { redirect } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconPlug, IconSettingsCode, IconRobot, IconChecklist } from "@tabler/icons-react";
import Link from "next/link";
import { HomeAutoSync } from "./home-auto-sync";

export default async function HomePage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const onboardingSteps = [
    {
      title: "1. Connect Your ALM Account (Jira/DevOps)",
      description: "Securely link your enterprise tools, such as Jira, Azure DevOps, or Polarion. This step enables instant synchronization of your existing requirements (User Stories/Epics) and sets up the deployment pipeline for generated test cases.",
      icon: IconPlug,
      href: "/integrations/atlassian"
    },
    {
      title: "2. Define Compliance & Governance",
      description: "Select the required regulatory standards (HIPAA, ISO 13485, etc.) to establish grounding. Then, enforce specific organizational rules at the project level to ensure the AI adheres to your internal policies.",
      icon: IconSettingsCode,
      href: "/projects"
    },
    {
      title: "3. Schedule & Generate Test Cases",
      description: "Select the requirements you need coverage for and schedule a bulk generation job. Our AI runs in parallel to deliver comprehensive functional, safety, and compliance-specific test cases.",
      icon: IconRobot,
      href: "/scheduler"
    },
    {
      title: "4. Review, Audit, and Deploy",
      description: "Review the AI-generated tests, which include a full Compliance Audit Log and citations for traceability. Make any final edits and deploy the fully compliant test suite directly back into your linked ALM platform.",
      icon: IconChecklist,
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
        {onboardingSteps.map((step) => (
          <Link key={step.title} href={step.href}>
            <Card className="h-full cursor-pointer relative overflow-hidden group">
              <CardHeader>
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <step.icon className="h-6 w-6 sm:h-8 sm:w-8 shrink-0" />
                  <CardTitle className="mb-0 text-base sm:text-lg">{step.title}</CardTitle>
                </div>
                <CardDescription className="text-sm">{step.description}</CardDescription>
              </CardHeader>
              <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity px-4">
                <step.icon className="h-10 w-10 sm:h-12 sm:w-12 mb-2 sm:mb-3" />
                <span className="text-base sm:text-lg font-semibold text-center">Go to {step.title}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
