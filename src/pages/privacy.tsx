import Link from 'next/link';
import { useRouter } from 'next/router';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-8 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: May 5, 2026</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700">
                Airswift ("we" or "us" or "our") operates the Airswift website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Collection and Use</h2>
              <p className="text-gray-700 mb-4">We collect several different types of information for various purposes to provide and improve our Service to you.</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">Types of Data Collected:</h3>
              <ul className="space-y-2 ml-6 text-gray-700">
                <li className="list-disc"><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to:
                  <ul className="mt-2 ml-6 space-y-1">
                    <li className="list-disc">Email address</li>
                    <li className="list-disc">First name and last name</li>
                    <li className="list-disc">Phone number</li>
                    <li className="list-disc">Address, State, Province, ZIP/Postal code, City</li>
                    <li className="list-disc">Cookies and Usage Data</li>
                  </ul>
                </li>
                <li className="list-disc"><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used ("Usage Data"). This may include information such as your computer's Internet Protocol address, browser type, browser version, the pages you visit, the time and date of your visit, and other diagnostic data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Security of Data</h2>
              <p className="text-gray-700">
                The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Communication</h2>
              <p className="text-gray-700">
                We may use your Personal Data to contact you with newsletters, marketing or promotional materials and other information that may be of interest to you. You may opt out of any, or all, of these communications by following the unsubscribe link or instructions provided in any email we send.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-gray-700">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy, please contact us at support@airswift.com or visit our <Link href="/contact" className="text-blue-600 hover:text-blue-700">contact page</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">User Rights</h2>
              <p className="text-gray-700 mb-4">You have certain rights regarding your personal data:</p>
              <ul className="space-y-2 ml-6 text-gray-700">
                <li className="list-disc">The right to access your personal data</li>
                <li className="list-disc">The right to correct inaccurate data</li>
                <li className="list-disc">The right to request deletion of your data</li>
                <li className="list-disc">The right to object to processing of your data</li>
                <li className="list-disc">The right to request restriction of processing</li>
                <li className="list-disc">The right to data portability</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
