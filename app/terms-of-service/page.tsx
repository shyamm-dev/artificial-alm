import Link from "next/link";
import { Button } from "@/components/ui/button";

const TermsOfServicePage = () => {
  return (
    <div className="container mx-auto p-8 relative">
      <div className="absolute top-4 right-4">
        <Link href="/projects" passHref>
          <Button>Go to App</Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="text-gray-700 leading-relaxed">
          By accessing and using this application (&quot;App&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the App.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
        <p className="text-gray-700 leading-relaxed">
          This App provides integration with Atlassian services, allowing users to access and manage certain Jira content. The App uses Atlassian OAuth for authentication and authorization.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. User Data and Privacy</h2>
        <p className="text-gray-700 leading-relaxed">
          We collect minimal user information through Atlassian OAuth, including your username, email address, and profile image. We may also access Jira content as explicitly permitted by you during the Atlassian OAuth consent process. For more details, please refer to our <Link href="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</Link>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
        <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 leading-relaxed">
          <li>You are responsible for maintaining the confidentiality of your Atlassian account credentials.</li>
          <li>You agree to use the App only for lawful purposes and in accordance with these Terms.</li>
          <li>Any write actions to your Jira instance through this App require your explicit consent and verification for each operation. The App will not perform any automated write actions without your direct approval.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
        <p className="text-gray-700 leading-relaxed">
          All content and materials available on the App, including but not limited to text, graphics, website name, code, images, and logos are the intellectual property of the App owner and are protected by applicable copyright and trademark law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
        <p className="text-gray-700 leading-relaxed">
          The App is provided &quot;as is&quot; without any warranties, express or implied. We do not guarantee the accuracy, completeness, or usefulness of any information on the App. We will not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your use of, or inability to use, the App.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
        <p className="text-gray-700 leading-relaxed">
          We reserve the right to modify these Terms at any time. Your continued use of the App after any such changes constitutes your acceptance of the new Terms.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
        <p className="text-gray-700 leading-relaxed">
          If you have any questions about these Terms, please contact us.
        </p>
      </section>
    </div>
  );
};

export default TermsOfServicePage;