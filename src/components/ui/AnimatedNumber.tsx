import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface AnimatedNumberProps {
  value: number;
}

export default function AnimatedNumber({ value }: AnimatedNumberProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);
  
  useGSAP(() => {
    if (!spanRef.current) return;
    
    const obj = { val: prevValue.current };
    
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
    
    prevValue.current = value;
  }, [value]);

  return <span ref={spanRef}>{prevValue.current.toLocaleString()}</span>;
}
