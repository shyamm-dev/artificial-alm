import Link from "next/link";
import { Button } from "@/components/ui/button";

const PrivacyPolicyPage = () => {
    return (
        <div className="container mx-auto p-8 relative">
            <div className="absolute top-4 right-4">
                <Link href="/projects" passHref>
                    <Button>Go to App</Button>
                </Link>
            </div>
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed">
                    Welcome to our Privacy Policy page. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regard to your personal information, please contact us.
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                    This Privacy Policy applies to all information collected through our website, and/or any related services, sales, marketing or events (we refer to them collectively in this Privacy Policy as the &quot;Services&quot;).
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. What Information Do We Collect?</h2>
                <h3 className="text-xl font-medium mb-2">Personal information you disclose to us</h3>
                <p className="text-gray-700 leading-relaxed">
                    We collect personal information that you voluntarily provide to us when registering at the Services, expressing an interest in obtaining information about us or our products and services, when participating in activities on the Services or otherwise contacting us.
                </p>
                <p className="text-gray-700 leading-relaxed mt-2">
                    The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make and the products and features you use. When you use Atlassian as an OAuth provider, we collect minimal user information. The personal information we collect can include the following:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 leading-relaxed">
                    <li>Username</li>
                    <li>Email address</li>
                    <li>Profile image</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-2">
                    We may also access Jira content that you explicitly allow through the Atlassian OAuth consent process. Any write actions to your Jira instance are not performed automatically; they require your explicit consent and verification for each operation.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. How Do We Use Your Information?</h2>
                <p className="text-gray-700 leading-relaxed">
                    We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. We indicate the specific processing grounds we rely on next to each purpose listed below.
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700 leading-relaxed">
                    <li>To facilitate account creation and logon process using Atlassian OAuth.</li>
                    <li>To manage user accounts and provide access to features requiring Atlassian integration.</li>
                    <li>To read Jira content as explicitly permitted by you through Atlassian OAuth.</li>
                    <li>To send administrative information to you.</li>
                    <li>To protect our Services.</li>
                    <li>To enforce our terms, conditions and policies for business purposes, to comply with legal and regulatory requirements or in connection with our contract.</li>
                    <li>To respond to legal requests and prevent harm.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Will Your Information Be Shared With Anyone?</h2>
                <p className="text-gray-700 leading-relaxed">
                    We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. How Long Do We Keep Your Information?</h2>
                <p className="text-gray-700 leading-relaxed">
                    We keep your information for as long as necessary to fulfill the purposes outlined in this privacy policy unless otherwise required by law.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. How Do We Keep Your Information Safe?</h2>
                <p className="text-gray-700 leading-relaxed">
                    We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. What Are Your Privacy Rights?</h2>
                <p className="text-gray-700 leading-relaxed">
                    You have certain rights under applicable data protection laws. These may include the right to request access and obtain a copy of your personal information, to request rectification or erasure, to restrict the processing of your personal information, and if applicable, to data portability.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Do We Make Updates To This Policy?</h2>
                <p className="text-gray-700 leading-relaxed">
                    Yes, we will update this policy as necessary to stay compliant with relevant laws.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4">9. How Can You Contact Us About This Policy?</h2>
                <p className="text-gray-700 leading-relaxed">
                    If you have questions or comments about this policy, you may email us.
                </p>
            </section>
        </div>
    );
};

export default PrivacyPolicyPage;
