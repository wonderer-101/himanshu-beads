import LegalPage from "@/components/legal/LegalPage";

export default function ContactUsPage() {
  return (
    <LegalPage title="Contact Us">
      <section>
        <h2>Customer Support</h2>
        <p>
          We are here to help with product questions, order support, shipping updates,
          and policy queries.
        </p>
      </section>

      <section>
        <h2>Email</h2>
        <p>
          <a href="mailto:himanshubeads18@gmail.com">himanshubeads18@gmail.com</a>
        </p>
      </section>

      <section>
        <h2>Call / WhatsApp</h2>
        <p>
          <a href="tel:+918619299132">+91 861 929 9132</a>
          <br />
          <a
            href="https://wa.me/918619299132"
            target="_blank"
            rel="noreferrer"
          >
            Chat on WhatsApp
          </a>
        </p>
      </section>
    </LegalPage>
  );
}
