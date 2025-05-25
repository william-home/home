// 游戏常量
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    'transparent',
    '#FF0D72', // I
    '#0DC2FF', // J
    '#0DFF72', // L
    '#F538FF', // O
    '#FF8E0D', // S
    '#FFE138', // T
    '#3877FF'  // Z
];

// 方块形状定义
const SHAPES = [
    [], // 空占位
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]],                         // J
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]],                         // L
    [[0, 4, 4], [0, 4, 4], [0, 0, 0]],                         // O
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]],                         // S
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]],                         // T
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]]                          // Z
];

// 游戏状态
let canvas, ctx;
let nextCanvas, nextCtx;
let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;
let isPaused = false;
let dropInterval = 1000; // 初始下落速度
let dropCounter = 0;
let lastTime = 0;
let animationId = null;

// 游戏初始化
function init() {
    // 初始化主游戏画布
    canvas = document.getElementById('game-board');
    ctx = canvas.getContext('2d');
    
    // 设置画布大小
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    
    // 初始化预览画布
    nextCanvas = document.getElementById('next-piece');
    nextCtx = nextCanvas.getContext('2d');
    
    nextCanvas.width = 4 * BLOCK_SIZE;
    nextCanvas.height = 4 * BLOCK_SIZE;
    
    // 初始化游戏板
    createBoard();
    
    // 添加事件监听
    addEventListeners();
    
    // 更新分数显示
    updateScore();
    
    // 绘制游戏板
    draw();
}

// 创建游戏板
function createBoard() {
    board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
}

// 添加事件监听
function addEventListeners() {
    // 键盘控制
    document.addEventListener('keydown', handleKeyPress);
    
    // 游戏控制按钮
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('reset-btn').addEventListener('click', resetGame);
    
    // 移动端控制按钮
    document.getElementById('left-btn').addEventListener('touchstart', () => movePiece(-1, 0));
    document.getElementById('right-btn').addEventListener('touchstart', () => movePiece(1, 0));
    document.getElementById('down-btn').addEventListener('touchstart', () => movePiece(0, 1));
    document.getElementById('rotate-btn').addEventListener('touchstart', rotatePiece);
    document.getElementById('drop-btn').addEventListener('touchstart', dropPiece);
    
    // 防止移动端滚动
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('touchstart', e => e.preventDefault());
    });
    
    // 添加鼠标点击支持（兼容桌面端）
    document.getElementById('left-btn').addEventListener('click', () => movePiece(-1, 0));
    document.getElementById('right-btn').addEventListener('click', () => movePiece(1, 0));
    document.getElementById('down-btn').addEventListener('click', () => movePiece(0, 1));
    document.getElementById('rotate-btn').addEventListener('click', rotatePiece);
    document.getElementById('drop-btn').addEventListener('click', dropPiece);
}

// 处理键盘按键
function handleKeyPress(e) {
    if (gameOver || isPaused) return;
    
    switch (e.keyCode) {
        case 37: // 左箭头
            movePiece(-1, 0);
            break;
        case 39: // 右箭头
            movePiece(1, 0);
            break;
        case 40: // 下箭头
            movePiece(0, 1);
            break;
        case 38: // 上箭头
            rotatePiece();
            break;
        case 32: // 空格
            dropPiece();
            break;
    }
}

// 开始游戏
function startGame() {
    if (!gameOver && !isPaused) return;
    
    if (gameOver) {
        resetGame();
    }
    
    isPaused = false;
    document.getElementById('pause-btn').textContent = '暂停';
    
    if (!currentPiece) {
        createNewPiece();
    }
    
    animate();
}

// 暂停/继续游戏
function togglePause() {
    if (gameOver) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        document.getElementById('pause-btn').textContent = '继续';
        cancelAnimationFrame(animationId);
    } else {
        document.getElementById('pause-btn').textContent = '暂停';
        animate();
    }
}

// 重置游戏
function resetGame() {
    cancelAnimationFrame(animationId);
    
    createBoard();
    score = 0;
    level = 1;
    lines = 0;
    gameOver = false;
    isPaused = false;
    dropInterval = 1000;
    
    updateScore();
    document.getElementById('pause-btn').textContent = '暂停';
    
    createNewPiece();
    draw();
    animate();
}

// 创建新方块
function createNewPiece() {
    if (nextPiece) {
        currentPiece = nextPiece;
    } else {
        const shapeIndex = Math.floor(Math.random() * 7) + 1;
        currentPiece = {
            shape: SHAPES[shapeIndex],
            color: COLORS[shapeIndex],
            x: Math.floor(COLS / 2) - Math.floor(SHAPES[shapeIndex][0].length / 2),
            y: 0
        };
    }
    
    const shapeIndex = Math.floor(Math.random() * 7) + 1;
    nextPiece = {
        shape: SHAPES[shapeIndex],
        color: COLORS[shapeIndex],
        x: 0,
        y: 0
    };
    
    // 绘制下一个方块
    drawNextPiece();
    
    // 检查游戏是否结束
    if (!isValidMove(0, 0)) {
        gameOver = true;
        cancelAnimationFrame(animationId);
        alert('游戏结束！最终得分：' + score);
    }
}

// 绘制下一个方块
function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (!nextPiece) return;
    
    // 计算居中位置
    const offsetX = (nextCanvas.width - nextPiece.shape[0].length * BLOCK_SIZE) / 2;
    const offsetY = (nextCanvas.height - nextPiece.shape.length * BLOCK_SIZE) / 2;
    
    nextPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                nextCtx.fillStyle = COLORS[value];
                nextCtx.fillRect(
                    offsetX + x * BLOCK_SIZE,
                    offsetY + y * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
                
                nextCtx.strokeStyle = '#222';
                nextCtx.strokeRect(
                    offsetX + x * BLOCK_SIZE,
                    offsetY + y * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
            }
        });
    });
}

// 移动方块
function movePiece(dx, dy) {
    if (gameOver || isPaused) return;
    
    if (isValidMove(dx, dy)) {
        currentPiece.x += dx;
        currentPiece.y += dy;
        draw();
        return true;
    }
    
    // 如果是向下移动且不能移动，则固定方块
    if (dy > 0) {
        lockPiece();
        clearLines();
        createNewPiece();
    }
    
    return false;
}

// 旋转方块
function rotatePiece() {
    if (gameOver || isPaused) return;
    
    const originalShape = currentPiece.shape;
    const rotated = [];
    
    // 转置矩阵
    for (let y = 0; y < originalShape[0].length; y++) {
        rotated[y] = [];
        for (let x = 0; x < originalShape.length; x++) {
            rotated[y][x] = originalShape[originalShape.length - 1 - x][y];
        }
    }
    
    // 保存原始形状
    const originalPiece = {...currentPiece};
    currentPiece.shape = rotated;
    
    // 检查旋转后是否有效
    if (!isValidMove(0, 0)) {
        // 尝试墙踢（wall kick）
        const kicks = [
            [1, 0], [-1, 0], [0, 1], [1, 1], [-1, 1],
            [2, 0], [-2, 0]
        ];
        
        let validKick = false;
        
        for (const [dx, dy] of kicks) {
            if (isValidMove(dx, dy)) {
                currentPiece.x += dx;
                currentPiece.y += dy;
                validKick = true;
                break;
            }
        }
        
        // 如果所有墙踢都失败，恢复原始形状
        if (!validKick) {
            currentPiece.shape = originalPiece.shape;
        }
    }
    
    draw();
}

// 快速下落
function dropPiece() {
    if (gameOver || isPaused) return;
    
    while (movePiece(0, 1)) {
        // 继续下落直到不能移动
    }
}

// 检查移动是否有效
function isValidMove(dx, dy) {
    return currentPiece.shape.every((row, y) => {
        return row.every((value, x) => {
            if (value === 0) return true;
            
            const newX = currentPiece.x + x + dx;
            const newY = currentPiece.y + y + dy;
            
            return (
                newX >= 0 &&
                newX < COLS &&
                newY < ROWS &&
                (newY < 0 || board[newY][newX] === 0)
            );
        });
    });
}

// 固定方块到游戏板
function lockPiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const boardY = currentPiece.y + y;
                if (boardY >= 0) { // 确保不会写入负索引
                    board[boardY][currentPiece.x + x] = value;
                }
            }
        });
    });
}

// 清除已完成的行
function clearLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(value => value !== 0)) {
            // 移除该行
            board.splice(y, 1);
            // 在顶部添加新行
            board.unshift(Array(COLS).fill(0));
            // 增加行计数
            linesCleared++;
            // 由于行被移除，需要重新检查当前行
            y++;
        }
    }
    
    if (linesCleared > 0) {
        // 更新分数
        updateScoreWithLines(linesCleared);
    }
}

// 根据消除的行数更新分数
function updateScoreWithLines(linesCleared) {
    // 分数计算：单行100，双行300，三行500，四行800
    const points = [0, 100, 300, 500, 800];
    score += points[linesCleared] * level;
    
    // 更新总行数
    lines += linesCleared;
    
    // 每10行升一级
    level = Math.floor(lines / 10) + 1;
    
    // 更新下落速度
    dropInterval = Math.max(100, 1000 - (level - 1) * 100);
    
    // 更新显示
    updateScore();
}

// 更新分数显示
function updateScore() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

// 绘制游戏
function draw() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制游戏板
    drawBoard();
    
    // 绘制当前方块
    if (currentPiece) {
        drawPiece();
    }
}

// 绘制游戏板
function drawBoard() {
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = COLORS[value];
                ctx.fillRect(
                    x * BLOCK_SIZE,
                    y * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
                
                ctx.strokeStyle = '#222';
                ctx.strokeRect(
                    x * BLOCK_SIZE,
                    y * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
            }
        });
    });
}

// 绘制当前方块
function drawPiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = currentPiece.color;
                ctx.fillRect(
                    (currentPiece.x + x) * BLOCK_SIZE,
                    (currentPiece.y + y) * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
                
                ctx.strokeStyle = '#222';
                ctx.strokeRect(
                    (currentPiece.x + x) * BLOCK_SIZE,
                    (currentPiece.y + y) * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
            }
        });
    });
}

// 游戏动画循环
function animate(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    
    if (!isPaused && !gameOver) {
        dropCounter += deltaTime;
        
        if (dropCounter > dropInterval) {
            movePiece(0, 1);
            dropCounter = 0;
        }
        
        draw();
    }
    
    animationId = requestAnimationFrame(animate);
}

// 添加触摸滑动支持
let touchStartX = 0;
let touchStartY = 0;
let touchTimeStart = 0;

document.addEventListener('touchstart', e => {
    if (gameOver || isPaused) return;
    
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchTimeStart = Date.now();
});

document.addEventListener('touchmove', e => {
    if (gameOver || isPaused) return;
    if (!touchStartX || !touchStartY) return;
    
    // 防止页面滚动
    e.preventDefault();
    
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;
    const currentTime = Date.now();
    
    // 检测是否为快速滑动
    const isSwipe = currentTime - touchTimeStart < 250;
    
    // 水平移动需要更大的阈值，以避免误触
    if (Math.abs(diffX) > 30) {
        movePiece(diffX > 0 ? 1 : -1, 0);
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }
    
    // 向下滑动
    if (diffY > 50) {
        if (isSwipe) {
            // 快速下滑为硬降落
            dropPiece();
        } else {
            // 普通下滑为软降落
            movePiece(0, 1);
        }
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }
    
    // 向上滑动旋转
    if (diffY < -50) {
        rotatePiece();
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }
});

document.addEventListener('touchend', () => {
    touchStartX = 0;
    touchStartY = 0;
});

// 页面加载完成后初始化游戏
window.addEventListener('load', () => {
    init();
    
    // 显示开始游戏提示
    alert('点击"开始游戏"按钮开始游戏！\n\n电脑：方向键移动，上键旋转，空格快速下落\n手机：使用屏幕下方的控制按钮或滑动屏幕');
});
