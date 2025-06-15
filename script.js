// 显示随机祝福语
function showMessage() {
    const messages = [
        "愿你的每一天都如这特别的日子般闪耀！生日快乐！🎉",
        "新的一岁，愿你收获更多的欢笑、爱与成就！🎂",
        "感谢你一直以来的友谊，祝你拥有一个美妙的生日！🎁",
        "愿你的梦想在新的一年里一一实现，生日快乐！🎈",
        "祝你生日充满惊喜与欢乐，感谢你让这个世界更美好！🍰"
    ];
    
    const randomIndex = Math.floor(Math.random() * messages.length);
    const specialMessage = document.getElementById('special-message');
    specialMessage.textContent = messages[randomIndex];
}

// 添加雪花特效
function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.textContent = '❄';
    snowflake.style.left = Math.random() * window.innerWidth + 'px';
    snowflake.style.fontSize = Math.random() * 20 + 10 + 'px';
    snowflake.style.animationDuration = 5 + Math.random() * 5 + 's';
    snowflake.style.opacity = Math.random();
    document.body.appendChild(snowflake);
    
    setTimeout(() => {
        snowflake.remove();
    }, 10000);
}

// 初始化雪花
setInterval(createSnowflake, 300);

// 背景音乐控制
const birthdaySong = document.getElementById('birthday-song');
let hasUserInteracted = false;

// 添加用户交互检测
document.addEventListener('click', () => {
    hasUserInteracted = true;
}, { once: true });

// 确保音乐自动播放（可能需要用户交互）
window.addEventListener('DOMContentLoaded', () => {
    // 在页面加载完成后尝试播放音乐
    playMusic();
});

function toggleMusic() {
    if (birthdaySong.paused) {
        playMusic();
    } else {
        birthdaySong.pause();
    }
}

async function playMusic() {
    try {
        // 尝试播放音乐
        await birthdaySong.play();
        
        // 如果成功播放，隐藏播放按钮
        const musicButton = document.querySelector('.music-btn');
        if (musicButton) {
            musicButton.style.display = 'none';
        }
    } catch (error) {
        console.log('音乐播放被浏览器阻止:', error);
        
        // 如果播放失败，确保按钮可见并显示提示
        const musicButton = document.querySelector('.music-btn');
        if (musicButton) {
            musicButton.style.display = 'block';
            setTimeout(() => {
                alert('请点击播放按钮以启用背景音乐');
            }, 1000);
        }
    }
}

// 页面加载完成后初始化签名板
window.addEventListener('load', () => {
    initSignaturePad();
    updateCountdown();
});

// 设置画笔样式
function setPenStyle(width = 2, color = '#333') {
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
}

// 开始绘制
function startDrawing(e) {
    drawing = true;
    currentPath = [];
    const { offsetX, offsetY } = getEventLocation(e);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    currentPath.push({ x: offsetX, y: offsetY });
}

// 绘制中
function draw(e) {
    if (!drawing) return;
    const { offsetX, offsetY } = getEventLocation(e);
    currentPath.push({ x: offsetX, y: offsetY });
    
    // 使用贝塞尔曲线使线条更平滑
    if (currentPath.length > 3) {
        const p0 = currentPath[currentPath.length - 4];
        const p1 = currentPath[currentPath.length - 3];
        const p2 = currentPath[currentPath.length - 2];
        const p3 = currentPath[currentPath.length - 1];
        
        // 计算控制点
        const cp1x = (p0.x + p1.x) / 2;
        const cp1y = (p0.y + p1.y) / 2;
        const cp2x = (p1.x + p2.x) / 2;
        const cp2y = (p1.y + p2.y) / 2;
        
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p1.x, p1.y);
        setPenStyle(2 + Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) * 0.05);
        ctx.stroke();
    }
}

// 结束绘制
function stopDrawing() {
    if (drawing) {
        paths.push(currentPath);
        currentPath = [];
        drawing = false;
        ctx.closePath();
    }
}

// 获取事件坐标
function getEventLocation(e) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if (e.touches && e.touches.length > 0) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.offsetX;
        y = e.offsetY;
    }
    
    return { offsetX: x, offsetY: y };
}

// 清除画布
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paths = [];
    currentPath = [];
}

// 保存签名
function saveSignature() {
    // 创建一个临时canvas用于生成更清晰的图片
    const tempCanvas = document.createElement('canvas');
    const scale = 2; // 提高两倍分辨率
    tempCanvas.width = canvas.width * scale;
    tempCanvas.height = canvas.height * scale;
    
    const tempCtx = tempCanvas.getContext('2d');
    // 将原始内容缩放绘制到临时canvas上
    tempCtx.scale(scale, scale);
    tempCtx.drawImage(canvas, 0, 0);
    
    // 生成图片数据URL
    const dataURL = tempCanvas.toDataURL('image/png');
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `birthday_signature_${new Date().toISOString().slice(0,10)}.png`;
    link.click();
}

// 初始化事件监听器
function initSignaturePad() {
    // 鼠标事件
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    // 触摸事件
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    
    // 清除按钮
    document.querySelector('.clear-btn').addEventListener('click', clearCanvas);
    
    // 保存按钮
    document.querySelector('.save-btn').addEventListener('click', saveSignature);
}

// 页面加载完成后初始化签名板
window.addEventListener('load', () => {
    initSignaturePad();
    updateCountdown();
});