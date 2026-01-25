import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AudienceCards from "@/components/sections/AudienceCards";
import StepsCard from "@/components/sections/StepsCard";

import SecurityFeatures from "@/components/sections/SecurityFeatures";
import footer from "@/components/footer";
import CTA from "@/components/CTA";

export default function Home() {
	return (
		<main className='min-h-screen bg-brand-gradient selection:bg-white/30 selection:text-white'>
			<Navbar />
			<Hero />

			{/* Keeping existing sections for now */}
			<div className='bg-white'>
				<AudienceCards />
			</div>
      <StepsCard />
			<SecurityFeatures />

			{/* <footer className='py-12 border-t border-white/10 text-center text-white/40 text-sm'>
				<div className='container mx-auto px-6'>
					<p>© 2026 Chioma. Built with ❤️ on Stellar.</p>
				</div>
			</footer> */}

			  <CTA />

			     {/* <footer /> */}
		</main>
	);
}
