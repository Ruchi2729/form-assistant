import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ProductStory from './features/landing/ProductStory'
import UploadCard from './features/documents/UploadCard'
import LoginCard from './features/auth/LoginCard'
import useAppState from './state/useAppState'
import { canEnterWorkspace } from './state/appReducer'
import AgentEntry from './features/assistant/AgentEntry'
import PurposeSection from './features/landing/PurposeSection'

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
              <div className="min-w-0 space-y-4">
                <UploadCard />
                <div className="rounded-2xl border border-[#e4e6dd] bg-[#fffefa] px-6 pb-6 md:px-8 md:pb-8">
                  <LoginCard />
                </div>
              </div>
            </div>
            <PurposeSection />
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
