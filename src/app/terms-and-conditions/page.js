import LegalPage from "@/components/legal/LegalPage";

export default function TermsAndConditionsPage() {
  return (
    <LegalPage title="Terms & Conditions">
      <section>
        <h2>General</h2>
        <p>
          By using this website and placing an order with Himanshu Beads, you agree to these
          terms and all applicable policies on this site.
        </p>
      </section>

      <section>
        <h2>Product Information</h2>
        <p>
          We strive to keep product details and pricing accurate. Minor differences in color,
          finish, or presentation may occur due to photography and screen settings.
        </p>
      </section>

      <section>
        <h2>Order Acceptance</h2>
        <p>
          Orders are confirmed only after successful placement and verification. We reserve
          the right to cancel or refuse orders in case of pricing, stock, or technical issues.
        </p>
      </section>

      <section>
        <h2>Pricing and Payments</h2>
        <p>
          All prices are listed in INR unless stated otherwise. Payment must be completed
          through available checkout options before dispatch.
        </p>
      </section>

      <section>
        <h2>Support</h2>
        <p>
          For assistance, email{" "}
          <a href="mailto:himanshubeads18@gmail.com">himanshubeads18@gmail.com</a> or call/WhatsApp{" "}
          <a href="tel:+918619299132">+91 861 929 9132</a>.
        </p>
      </section>
    </LegalPage>
  );
}
