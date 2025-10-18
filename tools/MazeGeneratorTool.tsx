import React, { useState, useRef, useEffect, useCallback } from 'react';

class MazeGenerator {
    private width: number;
    private height: number;
    private maze: number[][];
    public solution: [number, number][];
    private cellSize: number;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    constructor(width: number, height: number, canvas: HTMLCanvasElement) {
        this.width = width;
        this.height = height;
        this.maze = [];
        this.solution = [];
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.initializeMaze();
    }

    private initializeMaze() {
        for (let y = 0; y < this.height; y++) {
            this.maze[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.maze[y][x] = 1; // 1 = wall, 0 = path
            }
        }
    }

    generateMaze() {
        const stack: [number, number][] = [];
        const startX = 1;
        const startY = 1;

        this.maze[startY][startX] = 0;
        stack.push([startX, startY]);

        const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]];

        while (stack.length > 0) {
            const [currentX, currentY] = stack[stack.length - 1];
            const neighbors: [number, number, number, number][] = [];

            for (const [dx, dy] of directions) {
                const newX = currentX + dx;
                const newY = currentY + dy;

                if (newX > 0 && newX < this.width - 1 && newY > 0 && newY < this.height - 1 && this.maze[newY][newX] === 1) {
                    // FIX: Changed undefined variable `nextY` to `newY`.
                    neighbors.push([newX, newY, dx / 2, dy / 2]);
                }
            }

            if (neighbors.length > 0) {
                const [nextX, nextY, wallX, wallY] = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.maze[currentY + wallY][currentX + wallX] = 0;
                this.maze[nextY][nextX] = 0;
                stack.push([nextX, nextY]);
            } else {
                stack.pop();
            }
        }
        this.maze[1][0] = 0; // Entrance
        this.maze[this.height - 2][this.width - 1] = 0; // Exit
    }

    // FIX: Corrected queue initialization and pathfinding logic. The queue now stores `[x, y, path]` to correctly reconstruct the solution path.
    solveMaze() {
        const queue: [number, number, [number, number][]][] = [[1, 1, []]];
        const visited = new Set<string>();
        visited.add('1,1');
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

        while (queue.length > 0) {
            const [x, y, path] = queue.shift()!;
            if (x === this.width - 2 && y === this.height - 2) {
                this.solution = [...path, [x, y]];
                return true;
            }
            for (const [dx, dy] of directions) {
                const newX = x + dx;
                const newY = y + dy;
                const key = `${newX},${newY}`;
                if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height && this.maze[newY][newX] === 0 && !visited.has(key)) {
                    visited.add(key);
                    queue.push([newX, newY, [...path, [x, y]]]);
                }
            }
        }
        return false;
    }

    draw(options: { wallColor: string, pathColor: string, startChar: string, endChar: string, showSolution: boolean }) {
        const { wallColor, pathColor, startChar, endChar, showSolution } = options;
        const canvasSize = Math.min(600, this.canvas.parentElement?.clientWidth || 600);
        this.cellSize = canvasSize / this.width;
        
        this.canvas.width = canvasSize;
        this.canvas.height = canvasSize;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.ctx.fillStyle = this.maze[y][x] === 1 ? wallColor : pathColor;
                this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
            }
        }

        if (showSolution && this.solution.length > 0) {
            this.ctx.strokeStyle = '#e74c3c';
            this.ctx.lineWidth = Math.max(2, this.cellSize / 7);
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.solution.forEach(([x, y], i) => {
                const centerX = x * this.cellSize + this.cellSize / 2;
                const centerY = y * this.cellSize + this.cellSize / 2;
                if (i === 0) this.ctx.moveTo(centerX, centerY);
                else this.ctx.lineTo(centerX, centerY);
            });
            this.ctx.stroke();
        }

        this.ctx.font = `${this.cellSize * 0.8}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(startChar, 1.5 * this.cellSize, 1.5 * this.cellSize);
        this.ctx.fillText(endChar, (this.width - 1.5) * this.cellSize, (this.height - 1.5) * this.cellSize);
    }
}

const CharacterOption: React.FC<{ char: string; isSelected: boolean; onClick: () => void }> = ({ char, isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`w-14 h-14 flex items-center justify-center text-2xl rounded-lg cursor-pointer transition-all duration-300 border-2 ${isSelected ? 'bg-brand-cyan text-brand-dark border-brand-cyan scale-110' : 'bg-brand-dark border-brand-mid hover:border-brand-light'}`}
    >
        {char}
    </div>
);

const MazeGeneratorTool: React.FC = () => {
    const [size, setSize] = useState(20);
    const [difficulty, setDifficulty] = useState('medium');
    const [wallColor, setWallColor] = useState('#0D1B2A');
    const [pathColor, setPathColor] = useState('#E0E1DD');
    const [startChar, setStartChar] = useState('🐰');
    const [endChar, setEndChar] = useState('🥕');
    const [isLoading, setIsLoading] = useState(true);
    const [solutionVisible, setSolutionVisible] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mazeInstanceRef = useRef<MazeGenerator | null>(null);

    const startChars = ['🐧', '🦊', '🐸', '🐰', '⭐'];
    const endChars = ['🐠', '🍎', '🎯', '🏠', '🥕'];

    const redrawMaze = useCallback(() => {
        if (mazeInstanceRef.current) {
            mazeInstanceRef.current.draw({ wallColor, pathColor, startChar, endChar, showSolution: solutionVisible });
        }
    }, [wallColor, pathColor, startChar, endChar, solutionVisible]);
    
    useEffect(() => {
        redrawMaze();
    }, [redrawMaze]);

    const handleGenerateMaze = useCallback(() => {
        if (!canvasRef.current) return;
        setIsLoading(true);
        setTimeout(() => {
            let mazeSize = size;
            if (difficulty === 'easy') mazeSize = Math.max(10, size - 5);
            if (difficulty === 'hard') mazeSize = Math.min(40, size + 10);
            
            const maze = new MazeGenerator(mazeSize, mazeSize, canvasRef.current);
            maze.generateMaze();
            maze.solveMaze();
            mazeInstanceRef.current = maze;

            setSolutionVisible(false); // Hide solution on new maze
            // The redraw will be triggered by the useEffect watching the draw parameters
            setIsLoading(false);
            
            // Explicitly call draw here to ensure it runs after maze generation
            maze.draw({ wallColor, pathColor, startChar, endChar, showSolution: false });

        }, 500);
    }, [size, difficulty, wallColor, pathColor, startChar, endChar]);

    useEffect(() => {
        handleGenerateMaze();
    }, []); // Generate on initial load

    const handleSolveMaze = () => {
        setSolutionVisible(prev => !prev);
    };

    const handleDownloadMaze = () => {
        if (canvasRef.current) {
            const link = document.createElement('a');
            link.download = `maze-${new Date().getTime()}.png`;
            link.href = canvasRef.current.toDataURL();
            link.click();
        }
    };
    
    const inputClasses = "w-full bg-brand-dark border border-brand-mid rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan";

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-2">🧩 إنتاج متاهات للأطفال</h2>
            <p className="text-brand-light mb-6">إنشاء متاهات تفاعلية وممتعة للأطفال قابلة للطباعة.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
                {/* Controls */}
                <div className="bg-brand-blue p-6 rounded-lg border border-brand-mid flex flex-col gap-4">
                    <h5 className="text-xl font-bold text-white">⚙️ إعدادات المتاهة</h5>
                    <div>
                        <label className="block text-brand-light mb-2">حجم المتاهة: <span className="text-white font-bold">{size}</span></label>
                        <input type="range" min="10" max="40" value={size} onChange={e => setSize(Number(e.target.value))} className="w-full accent-brand-cyan" />
                    </div>
                    <div>
                        <label className="block text-brand-light mb-2">صعوبة المتاهة:</label>
                        <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={inputClasses}>
                            <option value="easy">سهل</option><option value="medium">متوسط</option><option value="hard">صعب</option>
                        </select>
                    </div>
                    
                    <h5 className="text-xl font-bold text-white mt-4">🎨 تخصيص الشكل</h5>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-brand-light mb-2">لون الجدران:</label>
                           <input type="color" value={wallColor} onChange={e => setWallColor(e.target.value)} className="w-full h-10 p-1 bg-brand-dark border border-brand-mid rounded cursor-pointer" />
                        </div>
                        <div>
                           <label className="block text-brand-light mb-2">لون المسار:</label>
                           <input type="color" value={pathColor} onChange={e => setPathColor(e.target.value)} className="w-full h-10 p-1 bg-brand-dark border border-brand-mid rounded cursor-pointer" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-brand-light mb-2">شخصية البداية:</label>
                        <div className="flex flex-wrap gap-2">{startChars.map(c => <CharacterOption key={c} char={c} isSelected={startChar === c} onClick={() => setStartChar(c)} />)}</div>
                     </div>
                     <div>
                        <label className="block text-brand-light mb-2">هدف النهاية:</label>
                        <div className="flex flex-wrap gap-2">{endChars.map(c => <CharacterOption key={c} char={c} isSelected={endChar === c} onClick={() => setEndChar(c)} />)}</div>
                     </div>
                     <div className="mt-auto pt-4 border-t border-brand-mid grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button onClick={handleGenerateMaze} className="bg-brand-cyan text-brand-dark font-bold py-2 px-4 rounded-lg">إنشاء جديد</button>
                        <button onClick={handleSolveMaze} className="bg-brand-mid text-white font-bold py-2 px-4 rounded-lg">{solutionVisible ? 'إخفاء الحل' : 'إظهار الحل'}</button>
                        <button onClick={handleDownloadMaze} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg">تحميل</button>
                     </div>
                </div>
                {/* Canvas */}
                <div className="flex items-center justify-center bg-brand-dark p-2 rounded-lg border border-brand-mid">
                    {isLoading && <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-cyan"></div>}
                    <canvas ref={canvasRef} className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`} />
                </div>
            </div>
        </div>
    );
};

export default MazeGeneratorTool;
