/**
 * 文言文答题系统 - 主逻辑文件
 * 功能：登录验证、题库加载、答题判分、积分兑换
 */

// ==================== 全局变量 ====================
let currentQuestion = 0;  // 当前题号
let score = 0;           // 用户得分
let questions = [];      // 题库数据
let isInitialized = false; // 防止重复初始化
let stars = document.querySelectorAll('.star');

// ==================== 核心函数 ====================

/**
 * 从网络加载题库 (使用免费JSON托管服务)
 */
async function loadQuestions() {
    try {
        // 使用公开的测试API（实际项目请替换为自己的URL）
        const response = await fetch('https://api.npoint.io/e87404d8bcddf1b5e4dd');

        if (!response.ok) throw new Error(`HTTP错误! 状态码: ${response.status}`);

        const data = await response.json();
        return data.questions || [];  // 返回解析后的题库

    } catch (error) {
        console.error('题库加载失败:', error);

        // 备用题库（网络失败时使用）
        return [
            {
                question: "《木兰诗》'安能辨我是雄雌'中'安'的意思是",
                options: ["安全", "怎么", "安定", "哪里"],
                answer: 1
            },
            {
                question: "'见其发矢十中八九'（《卖油翁》）'矢'指",
                options: ["箭", "失手", "发誓", "屎"],
                answer: 0
            }
            // 可继续添加更多备用题目...
        ];
    }
}

/**
 * 显示当前题目
 */
function showQuestion() {
    // 检查题库状态
    if (!questions || questions.length === 0) {
        alert('题库未加载，请刷新页面！');
        return;
    }

    // 检查是否所有题目已完成
    if (currentQuestion >= questions.length) {
        alert(`答题完成！最终得分: ${score}`);
        currentQuestion = 0; // 重置为第一题
        return;
    }

    // 获取当前题目数据
    const q = questions[currentQuestion];
    const questionEl = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');

    // 题目淡入效果
    questionEl.style.opacity = 0;
    optionsContainer.style.opacity = 0;

    // 更新题目显示
    questionEl.innerHTML = `
        <span style="color:#4ecdc4;">第 ${currentQuestion + 1} 题</span><br>
        ${q.question}
    `;

    // 清空并重建选项按钮
    optionsContainer.innerHTML = '';
    q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;

        // 使用闭包保存当前选项索引
        btn.onclick = (function (idx) {
            return function () {
                checkAnswer(idx);
            };
        })(index);

        optionsContainer.appendChild(btn);
    });

    // 淡入动画
    setTimeout(() => {
        questionEl.style.opacity = 1;
        optionsContainer.style.opacity = 1;
    }, 200);
}

/**
 * 检查答案正误
 * @param {number} selectedIndex 用户选择的选项索引
 */
function checkAnswer(selectedIndex) {
    const correctIndex = questions[currentQuestion].answer;
    const options = document.querySelectorAll('.option-btn');

    // 视觉反馈
    if (selectedIndex === correctIndex) {
        score += 5;
        document.getElementById('score').textContent = score;
        options[selectedIndex].style.background = 'rgba(78, 205, 196, 0.5)';
        // 答对题目时，星星闪烁频率加快
        stars.forEach(star => {
            star.style.animationDuration = '1s';
            setTimeout(() => {
                star.style.animationDuration = '3s';
            }, 2000);
        });
    } else {
        options[selectedIndex].style.background = 'rgba(255, 107, 107, 0.5)';
        options[correctIndex].style.background = 'rgba(78, 205, 196, 0.5)';
    }

    // 1秒后进入下一题
    currentQuestion++;
    setTimeout(showQuestion, 1000);
}

/**
 * 积分兑换功能
 * @param {number} points 需要的积分
 */
function redeem(points) {
    if (score >= points) {
        score -= points;
        document.getElementById('score').textContent = score;

        if (points === 15) {
            // 兑换音乐
            const audio = document.getElementById('music-player');
            audio.src = 'https://dlink.host/musics/aHR0cHM6Ly9vbmVkcnYtbXkuc2hhcmVwb2ludC5jb20vOnU6L2cvcGVyc29uYWwvc3Rvcl9vbmVkcnZfb25taWNyb3NvZnRfY29tL0VaaHh6eDdWRFlaT2tXZkN6czVHU19nQnhXWjRtSlNQR3hWNkhMYnF3SDE0Z2c.mp3';
            audio.play().catch(e => {
                // 移动端需用户交互后才能播放
                alert('请点击页面任意位置激活音频播放');
            });
            alert('🎵 成功兑换古风音乐');
        } else {
            // 兑换视频
            window.open('https://holcc-cdn.haier.net/lemc/aliyun1/20250503/5f5fd8c5462641a58ff368824e90f2a1.mp4', '_blank');
            alert('🎥 成功兑换文人短视频');
        }
    } else {
        alert(`文韵值不足！还需${points - score}分`);
    }
}

/**
 * 停止音乐播放
 */
function stopMusic() {
    const audio = document.getElementById('music-player');
    audio.pause();
    audio.currentTime = 0;
}

// ==================== 初始化应用 ====================

/**
 * 初始化整个应用
 */
async function initApp() {
    if (isInitialized) return;
    isInitialized = true;

    console.log('正在初始化应用...');

    // 1. 加载题库
    questions = await loadQuestions();
    console.log('题库加载完成，题量:', questions.length);

    // 2. 绑定登录按钮
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                alert('请输入尊号和密令！');
                return;
            }

            // 验证题库是否可用
            if (questions.length === 0) {
                alert('题库加载异常，请刷新页面！');
                return;
            }

            // 切换界面
            const loginContainer = document.getElementById('login-container');
            const mainContainer = document.getElementById('main-container');

            loginContainer.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => {
                loginContainer.style.display = 'none';
                mainContainer.style.display = 'block';
                mainContainer.style.animation = 'fadeIn 0.5s ease-out';
                showQuestion();
            }, 500);
        });
    } else {
        console.error('错误：未找到登录按钮');
    }

    // 3. 绑定兑换按钮（事件委托）
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('redeem-btn')) {
            const points = parseInt(e.target.dataset.points);
            if (!isNaN(points)) redeem(points);
        }
    });

    console.log('应用初始化完成');
}

// 添加淡出动画
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// ==================== 启动应用 ====================
// 安全启动（兼容旧浏览器）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}