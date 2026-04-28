import { motion } from 'framer-motion';

const exploreItems = [
  {
    title: "Trending Now",
    image: "/images/midnight-stealth.png",
    link: "Shop Now"
  },
  {
    title: "New Arrivals",
    image: "/images/deep-ocean-blue.png",
    link: "Explore"
  },
  {
    title: "Limited Edition",
    image: "/images/crimson-red.png",
    link: "Discover"
  }
];

const MoreToExplore = () => {
  return (
    <section className="py-24 bg-[var(--bg)]">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-12">
        <h2 className="text-2xl font-medium text-[var(--text)] mb-8">
          More to Explore
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exploreItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative aspect-[4/5] overflow-hidden group cursor-pointer rounded-xl bg-[var(--bg-secondary)]"
            >
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              
              <div className="absolute bottom-8 left-8 z-10 text-white">
                <h3 className="text-xl font-medium mb-4">{item.title}</h3>
                <button className="bg-white text-black px-6 py-2 rounded-full font-medium text-sm hover:bg-gray-200 transition-colors">
                  {item.link}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MoreToExplore;
