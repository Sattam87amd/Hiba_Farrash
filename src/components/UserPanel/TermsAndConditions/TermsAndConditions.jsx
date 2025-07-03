import React from 'react'

const Policies = () => {
  return (
   <div className="flex justify-center items-start min-h-screen bg-gray-100 px-4 pt-8 pb-8">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-6 md:p-10 mt-20">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
          Terms of Service
        </h1>
        <div className="space-y-8 text-gray-700 text-lg">
          <p>
            Welcome to <strong>Shourk</strong>. By accessing or using our services, you agree to be bound by these Terms of Service. 
            Please read these terms carefully before using our platform.
          </p>
          <ul className="list-decimal list-inside space-y-4">
            <li>
              <strong>Account Registration:</strong>
              <p>
                When registering with <strong>Shourk</strong>, you agree to:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>Provide accurate and complete information.</li>
                <li>Maintain the security of your account credentials.</li>
                <li>Accept responsibility for all activities that occur under your account.</li>
                <li>Notify us immediately of any unauthorized access.</li>
              </ul>
              <p>We reserve the right to suspend accounts that violate these conditions.</p>
            </li>
            <li>
              <strong>Service Use:</strong>
              <p>When using our services, you agree to:</p>
              <ul className="list-disc list-inside ml-4">
                <li>Use the platform for lawful purposes only.</li>
                <li>Respect intellectual property rights of content creators.</li>
                <li>Not engage in any activity that disrupts or impairs the functionality of our services.</li>
                <li>Not attempt to access restricted areas or data without authorization.</li>
              </ul>
              <p>Any violation may result in immediate termination of your access to our services.</p>
            </li>
            <li>
              <strong>Payment Terms:</strong>
              <p>
                By enrolling in our courses or purchasing services:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>You agree to pay all fees associated with your selected service plan.</li>
                <li>All payments are processed securely through our authorized payment processors.</li>
                <li>Refunds are subject to our refund policy, available upon request.</li>
                <li>We reserve the right to modify our pricing with appropriate notice.</li>
              </ul>
              <p>Failure to make timely payments may result in suspension of services.</p>
            </li>
            <li>
              <strong>Content Ownership:</strong>
              <p>
                Regarding content on our platform:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>All course materials and resources remain the property of <strong>Shourk</strong>.</li>
                <li>You may not reproduce, distribute, or create derivative works without permission.</li>
                <li>Any content you submit may be used by us for service improvement purposes.</li>
              </ul>
              <p>We respect intellectual property rights and expect users to do the same.</p>
            </li>
            <li>
              <strong>Limitation of Liability:</strong>
              <p>
                <strong>Shourk</strong> provides services "as is" without warranties of any kind:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>We are not liable for any indirect, incidental, or consequential damages.</li>
                <li>Our liability is limited to the amount paid by you for the specific service in question.</li>
                <li>We do not guarantee specific outcomes or results from using our services.</li>
              </ul>
              <p>Your use of our services is at your own risk.</p>
            </li>
            <li>
              <strong>Termination:</strong>
              <p>
                <strong>Shourk</strong> reserves the right to:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>Terminate or suspend access to our services without prior notice for violations of these terms.</li>
                <li>Modify or discontinue any aspect of our services at our discretion.</li>
                <li>Remove content that violates our policies or applicable laws.</li>
              </ul>
              <p>Upon termination, your rights to use our services will immediately cease.</p>
            </li>
            <li>
              <strong>Governing Law:</strong>
              <p>
                These Terms of Service shall be governed by and construed in accordance with applicable laws, without regard to its conflict of law principles.
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>Any disputes arising shall be resolved through arbitration or in courts of competent jurisdiction.</li>
                <li>You agree to submit to the personal jurisdiction of such courts for the purpose of litigating all such claims.</li>
              </ul>
            </li>
            <li>
              <strong>Changes to Terms:</strong>
              <p>
                <strong>Shourk</strong> may revise these Terms of Service at any time:
              </p>
              <ul className="list-disc list-inside ml-4">
                <li>We will provide notice of significant changes through our website or direct communication.</li>
                <li>Your continued use of our services after changes constitutes acceptance of the updated terms.</li>
              </ul>
              <p>We encourage you to review these terms regularly to stay informed.</p>
            </li>
          </ul>
          <p>
            By using <strong>Shourk</strong>'s services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you have any questions or concerns, please contact us for clarification before using our services.
          </p>
        </div>
      </div>
    </div>

  )
}

export default Policies
