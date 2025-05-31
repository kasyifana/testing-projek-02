'use client';

import { motion } from 'framer-motion';

export function InfoBoxes() {
  const boxes = [
    {
      id: 1,
      title: "Penanganan Cepat",
      icon: "⚡",
    },
    {
      id: 2,
      title: "Efektif",
      icon: "✅",
    },
    {
      id: 3,
      title: "Gratis",
      icon: "🆓",
    },
  ];

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 justify-center mt-8 md:mt-12">
      {boxes.map((box, index) => (
        <motion.div
          key={box.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3 + index * 0.5,
            duration: 0.5,
            ease: "easeOut"
          }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center text-center flex-1"
        >
          <div className="text-3xl mb-3">{box.icon}</div>
          <h3 className="font-semibold text-lg">{box.title}</h3>
        </motion.div>
      ))}
    </div>
  );
}
