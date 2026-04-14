import LegalPage from "@/components/legal/LegalPage";

export default function CancellationRefundPage() {
  return (
    <LegalPage title="Cancellation & Refund Policy">
      <section>
        <h2>Cancellation</h2>
        <p>
          Cancellation requests are accepted only before dispatch. Once an order is shipped,
          cancellation is not possible.
        </p>
      </section>

      <section>
        <h2>Returns and Exchanges</h2>
        <p>
          We currently do not offer return or exchange after delivery.
        </p>
      </section>

      <section>
        <h2>Refunds</h2>
        <p>
          If a cancellation is approved before dispatch, refund is initiated to the original
          payment method. Processing timelines depend on bank/payment partner cycles.
        </p>
      </section>

      <section>
        <h2>Need Help?</h2>
        <p>
          Write to{" "}
          <a href="mailto:himanshubeads18@gmail.com">himanshubeads18@gmail.com</a> or call/WhatsApp{" "}
          <a href="tel:+918619299132">+91 861 929 9132</a> with your order details.
        </p>
      </section>
    </LegalPage>
  );
}
