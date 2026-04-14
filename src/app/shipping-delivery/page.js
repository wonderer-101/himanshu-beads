import LegalPage from "@/components/legal/LegalPage";

export default function ShippingDeliveryPage() {
  return (
    <LegalPage title="Shipping & Delivery Policy">
      <section>
        <h2>Order Processing</h2>
        <p>
          Orders are processed after successful payment confirmation. Processing time may vary
          based on product type and order volume.
        </p>
      </section>

      <section>
        <h2>Delivery Timelines</h2>
        <p>
          Delivery timelines depend on destination and courier service availability. Delays due
          to weather, public holidays, or logistics disruptions may happen.
        </p>
      </section>

      <section>
        <h2>Shipping Charges</h2>
        <p>
          Shipping charges, if any, are shown during checkout before payment.
        </p>
      </section>

      <section>
        <h2>Tracking</h2>
        <p>
          Once dispatched, tracking details are shared through the contact information provided
          during order placement.
        </p>
      </section>

      <section>
        <h2>Support</h2>
        <p>
          For shipping support, email{" "}
          <a href="mailto:himanshubeads18@gmail.com">himanshubeads18@gmail.com</a> or call/WhatsApp{" "}
          <a href="tel:+918619299132">+91 861 929 9132</a>.
        </p>
      </section>
    </LegalPage>
  );
}
