import { useEffect, useState } from "react";

interface DecodingTextProps {
    text: string;
    speed?: number;
    charset?: string;
    placeholderChar?: string;
}

const DEFAULT_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:'\",.<>?/";

export function DecodingText({ text, speed = 50, charset = DEFAULT_CHARSET, placeholderChar = "_" }: DecodingTextProps) {
    const [displayText, setDisplayText] = useState<string>(placeholderChar.repeat(text.length));
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex >= text.length) return;

        const intervalId = setInterval(() => {
            setDisplayText((prevText) => {
                let tempText = prevText.split("");

                tempText[currentIndex] = text[currentIndex];

                for (let i = currentIndex + 1; i < text.length; i++) {
                    tempText[i] = charset[Math.floor(Math.random() * charset.length)];
                }

                return tempText.join("");
            });

            setCurrentIndex((prevIndex) => prevIndex + 1);
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed, charset, currentIndex]);

    return (displayText);
};