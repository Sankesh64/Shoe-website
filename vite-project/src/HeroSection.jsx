import { animate, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';

const EASE = [0.4, 0, 0.2, 1];

const particles = [
  { id: 1, size: 78, top: '10%', left: '56%', depth: 1.25, duration: 17, delay: 0.2, opacity: 0.96, floatX: 18, floatY: 26 },
  { id: 2, size: 26, top: '14%', left: '77%', depth: 0.78, duration: 14, delay: 0.6, opacity: 0.92, floatX: 10, floatY: 18 },
  { id: 3, size: 44, top: '22%', left: '70%', depth: 0.96, duration: 15.5, delay: 0.4, opacity: 0.88, floatX: 14, floatY: 22 },
  { id: 4, size: 14, top: '28%', left: '84%', depth: 0.7, duration: 12.5, delay: 0.1, opacity: 0.84, floatX: 9, floatY: 15 },
  { id: 5, size: 56, top: '36%', left: '62%', depth: 1.1, duration: 18.5, delay: 0.8, opacity: 0.94, floatX: 18, floatY: 28 },
  { id: 6, size: 22, top: '40%', left: '52%', depth: 0.82, duration: 13.8, delay: 0.5, opacity: 0.8, floatX: 12, floatY: 18 },
  { id: 7, size: 12, top: '46%', left: '75%', depth: 0.68, duration: 11.8, delay: 0.3, opacity: 0.78, floatX: 8, floatY: 13 },
  { id: 8, size: 34, top: '56%', left: '66%', depth: 0.93, duration: 16.2, delay: 0.9, opacity: 0.9, floatX: 13, floatY: 20 },
  { id: 9, size: 18, top: '61%', left: '82%', depth: 0.74, duration: 12.9, delay: 0.7, opacity: 0.76, floatX: 10, floatY: 16 },
  { id: 10, size: 10, top: '68%', left: '58%', depth: 0.62, duration: 10.5, delay: 0.4, opacity: 0.72, floatX: 8, floatY: 12 },
  { id: 11, size: 48, top: '72%', left: '72%', depth: 1.02, duration: 17.4, delay: 0.2, opacity: 0.92, floatX: 16, floatY: 24 },
  { id: 12, size: 16, top: '79%', left: '86%', depth: 0.7, duration: 12.6, delay: 0.5, opacity: 0.82, floatX: 9, floatY: 14 },
];

const FloatingParticle = ({ particle, mouseX, mouseY, reducedMotion, scrollYProgress }) => {
  const offsetX = useTransform(() => mouseX.get() * particle.depth * 34);
  const offsetY = useTransform(
    () => mouseY.get() * particle.depth * 24 + scrollYProgress.get() * (-78 * particle.depth)
  );

  return (
    <motion.div
      className="absolute will-change-transform z-0"
      style={{
        left: particle.left,
        top: particle.top,
        x: offsetX,
        y: offsetY,
      }}
    >
      <motion.div
        animate={
          reducedMotion
            ? undefined
            : {
                x: [0, particle.floatX, -particle.floatX * 0.35, particle.floatX * 0.12, 0],
                y: [0, -particle.floatY, particle.floatY * 0.24, -particle.floatY * 0.3, 0],
                scale: [1, 1.06, 0.97, 1.03, 1],
              }
        }
        className="rounded-full bg-black shadow-[0_28px_70px_rgba(17,17,17,0.16)] dark:bg-white dark:shadow-[0_28px_70px_rgba(255,255,255,0.16)]"
        style={{
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          opacity: particle.opacity * 0.2,
        }}
        transition={{
          delay: particle.delay,
          duration: particle.duration,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />
    </motion.div>
  );
};

const HeroSection = () => {
  const sectionRef = useRef(null);
  const fieldRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const mouseX = useSpring(rawMouseX, { stiffness: 110, damping: 22, mass: 0.8 });
  const mouseY = useSpring(rawMouseY, { stiffness: 110, damping: 22, mass: 0.8 });

  const { scrollYProgress } = useScroll();

  const handleMouseMove = (event) => {
    const bounds = fieldRef.current?.getBoundingClientRect();

    if (!bounds || prefersReducedMotion) {
      return;
    }

    const nextX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const nextY = (event.clientY - bounds.top) / bounds.height - 0.5;

    rawMouseX.set(nextX);
    rawMouseY.set(nextY);
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) {
      return;
    }

    animate(rawMouseX, 0, { duration: 0.9, ease: EASE });
    animate(rawMouseY, 0, { duration: 0.9, ease: EASE });
  };

  return (
    <section
      className="relative overflow-hidden py-16 sm:py-20 lg:py-24"
      id="hero"
      ref={sectionRef}
    >
      <div className="mx-auto grid min-h-[calc(100svh-140px)] w-full max-w-[1440px] items-center gap-14 px-6 sm:px-12 lg:grid-cols-2 lg:gap-20">
        <motion.div
          className="relative z-10 max-w-[42rem]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.45 }}
        >
          <motion.p
            className="mb-6 text-[1.1rem] font-medium tracking-wide text-[var(--text-muted)] sm:mb-8"
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            New Collection
          </motion.p>

          <motion.h1
            className="mb-8 text-[72px] font-light leading-[1.1] text-[var(--text)] tracking-tight"
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            Elevate Your Stride with RoeBook.
          </motion.h1>

          <motion.p
            className="mb-10 max-w-[32rem] text-lg leading-[1.8] text-[var(--text-body)]"
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            Discover our latest collection of sports and casual wear shoes for Men, Women & Kids. Designed for performance, engineered for life.
          </motion.p>

          <motion.a
            className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-8 py-4 text-base font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg"
            href="#shop"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            whileTap={{ scale: 0.95 }}
          >
            Shop the Collection
          </motion.a>

          {/* Stats Section */}
          <motion.div 
            className="mt-12 grid grid-cols-3 gap-8 border-t border-[var(--border)] pt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {[
              { label: 'Active Users', value: '10k+' },
              { label: 'Premium Shoes', value: '500+' },
              { label: 'Global Stores', value: '20+' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-bold text-[var(--text)]">{stat.value}</div>
                <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="relative h-[500px] w-full overflow-hidden rounded-[2rem] bg-[var(--bg-secondary)] lg:h-[700px] flex items-center justify-center p-8 group cursor-pointer"
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          ref={fieldRef}
          initial={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {particles.map((particle) => (
            <FloatingParticle
              key={particle.id}
              mouseX={mouseX}
              mouseY={mouseY}
              particle={particle}
              reducedMotion={prefersReducedMotion}
              scrollYProgress={scrollYProgress}
            />
          ))}

          <motion.div 
            className="relative z-10 w-full h-full flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <img 
              src="/images/hero-section-image.png" 
              alt="RoeBook Hero Shoe" 
              className="w-full h-full object-contain drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0px 25px 35px rgba(0,0,0,0.15))' }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
