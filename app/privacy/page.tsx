import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for El Pueblito covering contact form submissions, newsletter signups, and analytics.",
};

const sections = [
  {
    eyebrow: "What we collect",
    title: "Only what we need to run the site.",
    body: "If you contact us or join our email list, we may collect details you choose to send us, such as your name, email address, phone number, message, and selected location. We also collect limited device, browser, page, and interaction data through analytics tools.",
  },
  {
    eyebrow: "Why we use it",
    title: "To respond, improve, and measure.",
    body: "We use information to respond to inquiries, send updates you request, improve the website, understand traffic, and measure the performance of our pages and marketing.",
  },
  {
    eyebrow: "Analytics and pixels",
    title: "We use third-party measurement tools.",
    body: "We use analytics and advertising tools, including Google technologies and Meta Pixel, to measure traffic, understand page performance, and evaluate marketing. These tools may collect or receive information from your browser or device, such as pages viewed, referral data, approximate location, and interactions with this site.",
  },
  {
    eyebrow: "Sharing",
    title: "We do not sell personal information for money.",
    body: "We may share information with service providers that help us operate the website, process messages, send emails, host infrastructure, and analyze site performance. We may also disclose information if required by law or to protect our rights.",
  },
  {
    eyebrow: "Your choices",
    title: "You can limit tracking.",
    body: "You can opt out or limit certain ad and analytics technologies through your browser settings and industry tools such as the Digital Advertising Alliance choices page. You can also unsubscribe from marketing emails at any time.",
  },
  {
    eyebrow: "Contact",
    title: "Questions or requests.",
    body: "For privacy questions or requests, email hola@elpueblitonwa.com. We may update this page from time to time by posting a revised version here.",
  },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <main className="relative overflow-hidden px-4 py-8 md:px-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute top-10 left-[-4rem] h-40 w-40 rounded-full bg-[#F4C54A]/30 blur-3xl" />
        <div className="absolute top-28 right-[-2rem] h-52 w-52 rounded-full bg-[#016945]/20 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-44 w-44 rounded-full bg-[#CE1226]/15 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-stone-900/10 bg-[#F5EBDD]/90 p-5 shadow-[0_20px_80px_rgba(34,30,27,0.10)] backdrop-blur md:p-8">
          <div className="mb-8 grid gap-6 border-b border-stone-900/10 pb-8 md:grid-cols-[1.15fr_0.85fr] md:items-end">
            <div>
              <p className="mb-3 inline-flex rounded-full border border-stone-900/10 bg-white/60 px-3 py-1 font-semibold text-[0.7rem] uppercase tracking-[0.24em] text-[#016945]">
                Privacy Policy
              </p>
              <h1 className="max-w-3xl font-ultrablack text-4xl leading-none text-stone-950 md:text-6xl">
                Short, plain-language privacy terms.
              </h1>
            </div>

            <div className="rounded-[1.5rem] bg-[#221E1B] p-5 text-stone-50">
              <p className="font-semibold text-[#FFD9A2] text-xs uppercase tracking-[0.2em]">
                Last updated
              </p>
              <p className="mt-2 text-lg">March 10, 2026</p>
              <p className="mt-3 text-sm text-stone-300">
                This page is meant to be clear and minimal. It is not a promise
                that we collect more than we actually do.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {sections.map((section) => (
              <article
                className="rounded-[1.5rem] border border-stone-900/10 bg-white/60 p-5"
                key={section.title}
              >
                <p className="font-semibold text-[#CE1226] text-xs uppercase tracking-[0.18em]">
                  {section.eyebrow}
                </p>
                <h2 className="mt-2 font-ultrablack text-2xl leading-tight text-stone-950">
                  {section.title}
                </h2>
                <p className="mt-3 text-base leading-7 text-stone-700">
                  {section.body}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-dashed border-stone-900/15 bg-[#FFF8EF] p-5 text-sm leading-7 text-stone-700">
            <p>
              We may use Meta Pixel and similar tools to understand how people
              interact with the site and to measure advertising performance.
            </p>
            <p className="mt-3">
              For ad choices, you can visit{" "}
              <a
                className="font-semibold text-[#016945] underline decoration-stone-400 underline-offset-4"
                href="https://optout.aboutads.info/"
                rel="noreferrer"
                target="_blank"
              >
                aboutads.info/choices
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
