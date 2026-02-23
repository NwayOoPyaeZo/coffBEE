function Hero() {
  return (
    <section className="relative h-[calc(100vh-80px)] min-h-[560px] w-full overflow-hidden bg-honey-light dark:bg-honey-deep">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 transition-opacity duration-700 dark:opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1920&q=80')",
          backgroundAttachment: 'fixed',
        }}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <h2 className="mb-2 text-sm font-bold tracking-[0.3em] text-honey uppercase dark:text-honey-dark">
          Est. 2026 • Bangkok
        </h2>

        <h1 className="max-w-4xl font-serif text-5xl leading-tight font-black text-honey-deep dark:text-white md:text-8xl">
          Golden Brews for <br />
          <span className="relative inline-block text-honey">
            Busy Bees
            <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 338 12" fill="none">
              <path
                d="M3 9C118.5 -1 224.5 -1 335 9"
                stroke="#FFB300"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        <p className="mt-8 max-w-xl text-lg text-honey-deep/80 dark:text-honey-light/80 md:text-xl">
          Experience the world&apos;s first honey-infused espresso blend. Sourced sustainably,
          roasted locally, and served with a buzz.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#menu"
            className="rounded-full bg-honey px-8 py-4 text-lg font-bold text-honey-deep shadow-xl shadow-honey/30 transition-all hover:scale-105 hover:bg-honey-dark active:scale-95"
          >
            Taste the Magic
          </a>
          <a
            href="#story"
            className="rounded-full border-2 border-honey-deep/20 px-8 py-4 text-lg font-bold text-honey-deep transition-all hover:bg-honey-deep hover:text-white dark:border-honey/20 dark:text-honey dark:hover:bg-honey dark:hover:text-honey-deep"
          >
            Our Story
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg className="relative block h-[60px] w-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,-1.11,1200,0.47V0Z"
            className="fill-white transition-colors duration-300 dark:fill-honey-deep"
          />
        </svg>
      </div>
    </section>
  )
}

export default Hero
