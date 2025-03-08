import { useEffect, useState } from "react";

interface RandomartProps {
    uuid: string;
    speed?: number;
}

const width = 17, height = 9;

// Movement directions (Up, Down, Left, Right, UL, UR, DL, DR)
const directions: [number, number][] = [
    [0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]
];

// Symbols for visit frequency
const symbolMap = [" ", ".", "o", "O", "+", "=", "*", "B", "E"];

export function AnimatedRandomart({ uuid, speed = 100 }: RandomartProps) {
    // Convert UUID to byte array
    const hexString = uuid.replace(/-/g, "");
    const uuidBytes: number[] = [];
    for (let i = 0; i < hexString.length; i += 2) {
        uuidBytes.push(parseInt(hexString.substring(i, i + 2), 16));
    }

    // Initialize empty grid
    const [grid, setGrid] = useState<string[][]>(
        Array.from({ length: height }, () => Array(width).fill(" "))
    );

    // Start position at center
    const [x, setX] = useState(Math.floor(width / 2));
    const [y, setY] = useState(Math.floor(height / 2));

    useEffect(() => {
        let currentX = Math.floor(width / 2);
        let currentY = Math.floor(height / 2);
        let counts: Record<string, number> = {};
        let steps: [number, number][] = [];

        // Process each byte of UUID
        for (const byte of uuidBytes) {
            for (const nibble of [(byte >> 4) & 0xF, byte & 0xF]) {
                const [dx, dy] = directions[nibble % 8];
                currentX = Math.max(0, Math.min(width - 1, currentX + dx));
                currentY = Math.max(0, Math.min(height - 1, currentY + dy));

                const key = `${currentX},${currentY}`;
                counts[key] = (counts[key] || 0) + 1;
                steps.push([currentX, currentY]);
            }
        }

        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex >= steps.length) {
                clearInterval(interval);
                return;
            }

            const [stepX, stepY] = steps[stepIndex];

            setGrid((prevGrid) => {
                const newGrid = prevGrid.map((row) => [...row]);

                if (stepIndex < steps.length) {
                    newGrid[stepY][stepX] = symbolMap[Math.min(counts[`${stepX},${stepY}`], symbolMap.length - 1)];
                } else {
                    newGrid[stepY][stepX] = "E";
                }

                return newGrid;
            });

            setX(stepX);
            setY(stepY);
            stepIndex++;
        }, speed);

        return () => clearInterval(interval);
    }, [uuid, speed]);

    return (
        <div className="flex flex-col items-center font-mono">
            <div className=" inline-block">
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex">
                        {row.map((cell, colIndex) => (
                            <span
                                key={`${rowIndex}-${colIndex}`}
                                className={`w-4 h-4 flex items-center justify-center text-center ${x === colIndex && y === rowIndex ? "text-red-500 font-bold" : "text-gray-200"
                                    }`}
                            >
                                {cell}
                            </span>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}