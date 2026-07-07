import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface AnimatedNumberProps {
  value: number;
}

export default function AnimatedNumber({ value }: AnimatedNumberProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  
  useGSAP(() => {
    if (!spanRef.current) return;
    
    const obj = { val: 0 };
    
    gsap.to(obj, {
      val: value,
      duration: 1.2,
      ease: "power3.out",
      onUpdate: () => {
        if (spanRef.current) {
          spanRef.current.innerText = Math.round(obj.val).toLocaleString();
        }
      }
    });
  }, [value]);

  return <span ref={spanRef}>0</span>;
}
