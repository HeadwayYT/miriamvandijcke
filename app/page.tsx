const classTypes = [
  {
    name: "Bodypump",
    detail:
      "Barbell-based strength training with clear coaching, strong music and scalable options.",
  },
  {
    name: "Strength Development",
    detail:
      "Progressive strength work focused on technique, confidence and measurable progress.",
  },
  {
    name: "Bodyattack",
    detail:
      "High-energy cardio conditioning with athletic movement, rhythm and group motivation.",
  },
  {
    name: "Spinning",
    detail:
      "Indoor cycling sessions built around endurance, intervals, music and momentum.",
  },
];

const offers = [
  {
    eyebrow: "For individuals",
    title: "Personal Training",
    copy:
      "One-to-one coaching for people who want structure, accountability and a plan that fits their level.",
    items: ["Intake and goal setting", "Technique-focused sessions", "Strength and conditioning plans"],
  },
  {
    eyebrow: "For gyms and studios",
    title: "Group Classes",
    copy:
      "Energetic, well-structured classes for mixed-level groups in Antwerp and surrounding areas.",
    items: ["Substitute or recurring classes", "Clear cueing and safe progressions", "Motivating group atmosphere"],
  },
  {
    eyebrow: "For teams and events",
    title: "Projects & Workshops",
    copy:
      "Fitness sessions for companies, communities, wellness days, sport events or larger movement projects.",
    items: ["Corporate wellness", "Pop-up classes", "Custom movement programmes"],
  },
];

const faqs = [
  {
    question: "Where is Miriam based?",
    answer:
      "Miriam is based in Antwerp and teaches group classes at Basic-Fit and Pulsate. Other locations can be discussed for projects or personal training.",
  },
  {
    question: "Can beginners join?",
    answer:
      "Yes. Sessions can be adapted to different levels, with a focus on safe technique, confidence and steady progress.",
  },
  {
    question: "Can Miriam be booked for larger projects?",
    answer:
      "Yes. She can be contacted for group classes, company sessions, events, workshops and other fitness-related collaborations.",
  },
  {
    question: "How do I request personal training?",
    answer:
      "Use the contact form or message Miriam on Instagram with your goals, preferred location and availability.",
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header" aria-label="Main navigation">
        <a className="brand" href="#home" aria-label="Miriam Van Dijcke home">
          <span className="brand-mark">MVD</span>
          <span>Miriam Van Dijcke</span>
        </a>
        <nav>
          <a href="#about">About</a>
          <a href="#classes">Classes</a>
          <a href="#work">Work</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="kicker">Group fitness instructor in Antwerp</p>
          <h1>Train stronger. Move with energy.</h1>
          <p className="hero-text">
            Miriam Van Dijcke teaches Bodypump, Strength Development,
            Bodyattack and Spinning at Basic-Fit Bruul in Mechelen and Pulsate
            in Antwerp. Available for personal training, group classes and
            larger fitness projects.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#contact">
              Request training
            </a>
            <a className="button secondary" href="#classes">
              View classes
            </a>
          </div>
        </div>
        <div className="hero-visual" aria-label="Placeholder portrait area">
          <div className="portrait-card">
            <span>Portrait placeholder</span>
            <strong>Miriam Van Dijcke</strong>
          </div>
        </div>
      </section>

      <section className="about section" id="about">
        <div className="section-heading">
          <p className="kicker">About Miriam</p>
          <h2>Clear coaching, strong rhythm and a room full of momentum.</h2>
        </div>
        <div className="about-grid">
          <p>
            Miriam is a group fitness instructor active in Mechelen and
            Antwerp, with classes at Basic-Fit Bruul and Pulsate. Alongside her
            work in fitness, she has a permanent role as a Clinical Regulatory
            Affairs Specialist at GC Europe, bringing structure, precision and
            professionalism into everything she does.
          </p>
          <p>
            Her coaching style combines clear technique, positive energy and
            the ability to make different levels feel welcome in the same
            session. This website is a first home for her fitness work: a place
            where gyms, companies, event organisers and individuals can discover
            what she teaches and send a request.
          </p>
        </div>
      </section>

      <section className="section tinted" id="classes">
        <div className="section-heading">
          <p className="kicker">Classes</p>
          <h2>Four formats, one energetic coaching style.</h2>
        </div>
        <div className="class-grid">
          {classTypes.map((classType, index) => (
            <article className="class-card" key={classType.name}>
              <span className="class-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{classType.name}</h3>
              <p>{classType.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="work">
        <div className="section-heading split">
          <div>
            <p className="kicker">Work with Miriam</p>
            <h2>From one-to-one coaching to larger movement projects.</h2>
          </div>
          <p>
            Use these placeholders as the starting offer. We can later refine
            pricing, availability and booking flow when Miriam is ready.
          </p>
        </div>
        <div className="offer-grid">
          {offers.map((offer) => (
            <article className="offer-card" key={offer.title}>
              <p className="offer-eyebrow">{offer.eyebrow}</p>
              <h3>{offer.title}</h3>
              <p>{offer.copy}</p>
              <ul>
                {offer.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="gallery section" aria-label="Photo placeholders">
        <div className="gallery-intro">
          <p className="kicker">Atmosphere</p>
          <h2>Photo space for classes, training and projects.</h2>
        </div>
        <div className="photo-grid">
          <div className="photo-tile large">Class action placeholder</div>
          <div className="photo-tile">Spinning placeholder</div>
          <div className="photo-tile">Strength placeholder</div>
          <div className="photo-tile wide">Project or workshop placeholder</div>
        </div>
      </section>

      <section className="quote-band">
        <blockquote>
          "A motivating class starts with trust, clear guidance and the feeling
          that everyone can take the next step."
        </blockquote>
        <p>Placeholder quote for Miriam's coaching philosophy</p>
      </section>

      <section className="section faq">
        <div className="section-heading">
          <p className="kicker">FAQ</p>
          <h2>Practical questions before getting in touch.</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <article key={faq.question}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contact section" id="contact">
        <div className="contact-copy">
          <p className="kicker">Get in touch</p>
          <h2>Request personal training, a group class or a larger project.</h2>
          <p>
            Send a short message with the type of request, preferred timing and
            location. The form prepares an email to Miriam so she can follow up
            with availability and next steps.
          </p>
          <a
            className="instagram-link"
            href="https://www.instagram.com/mir.i.am_vd/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram: @mir.i.am_vd
          </a>
        </div>
        <form
          className="contact-form"
          action="mailto:miriam.s.presas@gmail.com"
          method="post"
          encType="text/plain"
        >
          <label>
            Name
            <input type="text" name="name" placeholder="Your name" />
          </label>
          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" />
          </label>
          <label>
            Request type
            <select name="request">
              <option>Personal training</option>
              <option>Group class</option>
              <option>Larger project</option>
              <option>Other collaboration</option>
            </select>
          </label>
          <label>
            Message
            <textarea
              name="message"
              placeholder="Tell Miriam what you are looking for"
              rows={5}
            />
          </label>
          <button type="submit">Send request</button>
        </form>
      </section>

      <footer>
        <p>Miriam Van Dijcke</p>
        <a
          href="https://www.instagram.com/mir.i.am_vd/"
          target="_blank"
          rel="noreferrer"
        >
          @mir.i.am_vd
        </a>
      </footer>
    </main>
  );
}
