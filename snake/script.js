class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [
            {x: 10, y: 10}
        ];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.updateDisplay();
        this.draw();
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.finalScoreElement = document.getElementById('finalScore');
        this.gameOverElement = document.getElementById('gameOver');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.restartBtn = document.getElementById('restartBtn');
        
        // 移动端方向按钮
        this.upBtn = document.getElementById('upBtn');
        this.downBtn = document.getElementById('downBtn');
        this.leftBtn = document.getElementById('leftBtn');
        this.rightBtn = document.getElementById('rightBtn');
    }
    
    changeDirection(newDx, newDy) {
        if (!this.gameRunning || this.gamePaused) return;
        
        // 防止反向移动
        if (newDx !== 0 && this.dx === -newDx) return;
        if (newDy !== 0 && this.dy === -newDy) return;
        
        this.dx = newDx;
        this.dy = newDy;
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    this.changeDirection(0, -1);
                    break;
                case 'ArrowDown':
                    this.changeDirection(0, 1);
                    break;
                case 'ArrowLeft':
                    this.changeDirection(-1, 0);
                    break;
                case 'ArrowRight':
                    this.changeDirection(1, 0);
                    break;
            }
        });
        
        // 按钮事件
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        
        // 移动端方向按钮事件
        const handleDirectionClick = (dx, dy) => {
            if (this.gameRunning && !this.gamePaused) {
                this.changeDirection(dx, dy);
            }
        };
        
        // 为每个按钮添加点击和触摸事件
        this.upBtn.addEventListener('click', () => handleDirectionClick(0, -1));
        this.upBtn.addEventListener('touchstart', (e) => {
            handleDirectionClick(0, -1);
        }, { passive: false });
        
        this.downBtn.addEventListener('click', () => handleDirectionClick(0, 1));
        this.downBtn.addEventListener('touchstart', (e) => {
            handleDirectionClick(0, 1);
        }, { passive: false });
        
        this.leftBtn.addEventListener('click', () => handleDirectionClick(-1, 0));
        this.leftBtn.addEventListener('touchstart', (e) => {
            handleDirectionClick(-1, 0);
        }, { passive: false });
        
        this.rightBtn.addEventListener('click', () => handleDirectionClick(1, 0));
        this.rightBtn.addEventListener('touchstart', (e) => {
            handleDirectionClick(1, 0);
        }, { passive: false });
        
        // 防止移动端按钮的默认行为
        [this.upBtn, this.downBtn, this.leftBtn, this.rightBtn].forEach(btn => {
            btn.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
            btn.addEventListener('contextmenu', (e) => e.preventDefault());
        });
    }
    
    generateFood() {
        return {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#1a202c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格背景
        this.ctx.strokeStyle = '#2d3748';
        this.ctx.lineWidth = 0.5;
        this.ctx.globalAlpha = 0.3;
        
        // 绘制垂直线
        for (let x = 0; x <= this.tileCount; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        // 绘制水平线
        for (let y = 0; y <= this.tileCount; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvas.width, y * this.gridSize);
            this.ctx.stroke();
        }
        
        // 重置透明度
        this.ctx.globalAlpha = 1.0;
        
        // 绘制蛇
        this.ctx.fillStyle = '#48bb78';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头用不同颜色
                this.ctx.fillStyle = '#38a169';
            } else {
                this.ctx.fillStyle = '#48bb78';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            // 添加蛇身的边框效果
            this.ctx.strokeStyle = '#2d3748';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        
        // 绘制食物
        this.ctx.fillStyle = '#e53e3e';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // 添加食物的光晕效果
        this.ctx.shadowColor = '#e53e3e';
        this.ctx.shadowBlur = 10;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // 检查自身碰撞
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateDisplay();
            this.food = this.generateFood();
            
            // 确保食物不会生成在蛇身上
            while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y)) {
                this.food = this.generateFood();
            }
        } else {
            this.snake.pop();
        }
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        // 设置初始移动方向（向右）
        this.dx = 1;
        this.dy = 0;
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 150);
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        this.pauseBtn.textContent = this.gamePaused ? '继续' : '暂停';
    }
    
    resetGame() {
        this.stopGame();
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.updateDisplay();
        this.draw();
    }
    
    stopGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = '暂停';
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
    }
    
    gameOver() {
        this.stopGame();
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateDisplay();
        }
        
        // 显示游戏结束界面
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.style.display = 'flex';
    }
    
    restartGame() {
        this.gameOverElement.style.display = 'none';
        this.resetGame();
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.highScoreElement.textContent = this.highScore;
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});

// 防止方向键滚动页面
window.addEventListener('keydown', (e) => {
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
});