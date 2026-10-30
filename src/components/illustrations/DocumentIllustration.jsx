export default function DocumentIllustration() {
  return (
    <div className="illustration" aria-hidden="true">
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="paper paper-back" />
      <div className="paper paper-front">
        <div className="paper-heading">
          <span className="paper-icon">≡</span>
          <span>YOUR NEXT CHAPTER</span>
        </div>
        <div className="paper-title">One step closer.</div>
        <div className="paper-line long" />
        <div className="paper-line medium" />
        <div className="paper-field">
          <span>Full name</span>
          <div className="paper-line medium" />
          <b>✓</b>
        </div>
        <div className="paper-field">
          <span>A fresh start</span>
          <div className="paper-line short" />
          <b>✓</b>
        </div>
        <div className="paper-field pending">
          <span>Let’s take the next step together</span>
          <span className="cursor" />
        </div>
        <div className="paper-bottom">
          <span>ONE QUESTION AT A TIME</span>
          <span>02 / 03</span>
        </div>
      </div>
      <div className="floating-note">
        <span>✓</span> At your own pace.</div>
      <span className="spark spark-one">✳</span>
      <span className="spark spark-two">+</span>
    </div>
  )
}
