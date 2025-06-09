'use client'

import { useEffect , useRef } from "react"
import gsap from "gsap"

export default function AnimatedTitle() {
    const titleRef = useRef<HTMLHeadingElement>(null)

    useEffect(() => {
        if(titleRef.current){
            gsap.fromTo(
                titleRef.current,
                { y: -100, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "bounce.out" }
            );
        }
    }, []);

    return (
            <h1 ref={titleRef} className="text-6xl font-extrabold text-black dark:text-white text-center">
                Hello GSAP! 🎉
            </h1>
    );
}