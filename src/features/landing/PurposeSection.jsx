import Disclosure from '../../components/ui/Disclosure.jsx'

export default function PurposeSection() {
  return (
    <section className="purpose-section" aria-labelledby="purpose-title">
      <div className="purpose-intro">
        <p className="eyebrow">WHY THIS MATTERS</p>
        <h2 id="purpose-title">
          Understanding a form is an accessibility need.
        </h2>
        <p>
          Dense instructions, remembering earlier answers, and figuring out the
          next step can add to cognitive overload. We’re designing guided help
          to reduce that burden, including for people with cognitive and
          learning disabilities.
        </p>
      </div>
      <div className="purpose-details">
        <Disclosure title="What research informs the design?">
          <p>
            W3C’s cognitive accessibility guidance recommends clear
            instructions, manageable steps, and processes that do not depend on
            remembering information from earlier screens. These principles guide
            our approach: plain-language explanations, one question at a time,
            and visible progress.
          </p>
          <a href="https://www.w3.org/TR/coga-usable/">
            Read W3C’s cognitive accessibility guidance
          </a>
          <p>
            A 2022 rapid evidence assessment reviewed 45 papers on web
            accessibility for people with cognitive disabilities. It describes
            persistent barriers and the importance of involving people with
            cognitive disabilities in research.
          </p>
          <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8869505/">
            Read the cognitive web accessibility evidence assessment
          </a>
          <p>
            Herd and Moynihan’s 2021 article describes how healthcare
            administration can consume patients’ time, money, and emotional
            energy. It helps explain why the burden of paperwork matters beyond
            the screen.
          </p>
          <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8522557/">
            Read Health care administrative burdens: Centering patient
            experiences
          </a>
          <p className="research-note">
            These sources guide our design choices. They are not evaluations or
            endorsements of Form Assistant.
          </p>
        </Disclosure>
        <Disclosure title="How are we approaching security?">
          <p>
            <strong>Your information deserves care.</strong> Forms can include
            identity, financial, and health details. Security and privacy belong
            at every step of completing them.
          </p>
          <p>
            <strong>Our security principles:</strong> minimize the information
            collected, prefer processing on your device, make AI data sharing an
            explicit choice, and keep document access restricted to its owner.
          </p>
          <p>
            <strong>Your decisions matter.</strong> Review sensitive answers and
            approve signature placement. No service can guarantee absolute
            security; avoid sharing information that a form does not require.
          </p>
          <p>
            This page loads fonts from Google Fonts, which receives your
            browser’s font requests.
          </p>
        </Disclosure>
      </div>
    </section>
  )
}
