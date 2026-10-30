import DocumentIllustration from '../../components/illustrations/DocumentIllustration'

export default function ProductStory() {
  return (
    <section className="story" aria-labelledby="story-title">
      <span className="eyebrow">
        <span /> LESS TO FIGURE OUT. MORE TO GET DONE.
      </span>
      <h1 id="story-title">
        Digital forms.
        <br />
        Too much <em>mental work.</em>
      </h1>
      <p className="intro">
        A new job. A doctor’s visit. A fresh start. Whatever’s next, we’ll help
        you <span className="text-glow">understand and fill the form</span>
        —without having to figure it all out alone.
      </p>
      <p className="problem-copy">
        It should feel as straightforward as putting pen to paper. Instead,
        confusing instructions, unfamiliar tools, and premium sign-up screens
        add more to think about. Filling a form should require{' '}
        <strong className="text-glow">no subscription.</strong>
      </p>
      <DocumentIllustration />
      <p className="story-caption">
        Understand it. Fill it. No premium membership.
      </p>
    </section>
  )
}
