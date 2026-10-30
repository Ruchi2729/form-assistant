import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import ProductStory from './features/landing/ProductStory.jsx'
import UploadCard from './features/documents/UploadCard.jsx'
import useAppState from './state/useAppState.js'
import { canEnterWorkspace } from './state/appReducer.js'
import AgentEntry from './features/assistant/AgentEntry.jsx'
import PurposeSection from './features/landing/PurposeSection.jsx'

export default function App() {
  const state = useAppState()
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <Header />
      <main id="main">
        {canEnterWorkspace(state) ? (
          <AgentEntry />
        ) : (
          <>
            <div className="mx-auto my-9 grid max-w-[1270px] grid-cols-1 items-center gap-7 px-6 min-[701px]:grid-cols-[1.08fr_1fr] min-[701px]:gap-8 min-[701px]:px-8 min-[951px]:gap-[75px] min-[951px]:px-[50px]">
              <ProductStory />
              <UploadCard />
            </div>
            <PurposeSection />
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
