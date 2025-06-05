import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const useFadeIn = (duration = 1, delay = 0) => {
  const element = useRef();

  useEffect(() => {
    if (element.current) {
      gsap.fromTo(
        element.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power2.out",
        }
      );
    }
  }, []);

  return { ref: element, style: { opacity: 0 } };
};

export const useStaggerAnimation = (selector, stagger = 0.1, delay = 0) => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger,
          delay,
          duration: 0.7,
          ease: "back.out(1.7)",
        }
      );
    }
  }, [selector, stagger, delay]);
};
