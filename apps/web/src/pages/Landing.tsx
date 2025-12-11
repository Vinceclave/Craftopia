import { Banner } from '@/components/home/Banner'
import { Features } from '@/components/home/Features'
import { HowItWorks } from '@/components/home/HowItWork'
import { Footer } from '@/components/home/Footer'

export const Landing = () => {
  return (
    <>
      <Banner />
      <Features />
      <HowItWorks />
      <Footer />
    </>
  )
}