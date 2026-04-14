import LegalPage from "@/components/legal/LegalPage";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <section>
        <h2>Information We Collect</h2>
        <p>
          We collect basic customer information such as name, email address, phone number,
          shipping address, and order details to process purchases and provide support.
        </p>
      </section>

      <section>
        <h2>How We Use Your Information</h2>
        <p>
          Your information is used to confirm orders, deliver products, send order updates,
          and resolve customer support requests.
        </p>
      </section>

      <section>
        <h2>Payments</h2>
        <p>
          Payments are processed through secure payment partners. We do not store your full
          card or sensitive banking details on our servers.
        </p>
      </section>

      <section>
        <h2>Data Sharing</h2>
        <p>
          We only share required information with logistics, payment, and platform providers
          for order fulfillment and operations.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          For privacy-related queries, contact us at{" "}
          <a href="mailto:himanshubeads18@gmail.com">himanshubeads18@gmail.com</a> or{" "}
          <a href="tel:+918619299132">+91 861 929 9132</a>.
        </p>
      </section>
    </LegalPage>
  );
}
