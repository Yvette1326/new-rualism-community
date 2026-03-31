// ===== 游戏状态管理 =====
const gameState = {
    currentPage: 'intro',
    chatStep: 0,
    notepadContent: '',
    currentSection: 'chat',
    fromDesktop: false
};

// ===== DOM元素引用 =====
const introPage = document.getElementById('intro-page');
const chatPage = document.getElementById('chat-page');
const chatMessages = document.getElementById('chat-messages');
const enterDetectiveNetBtn = document.getElementById('enter-detective-net');
const rolandBadge = document.getElementById('roland-badge');

// 内网导航
const menuItems = document.querySelectorAll('.menu-item');
const contentSections = document.querySelectorAll('.content-section');

// 模态框
const hackerModal = document.getElementById('hacker-modal');
const notepadModal = document.getElementById('notepad-modal');
const hackerOutput = document.getElementById('hacker-output');
const hackerIpInput = document.getElementById('hacker-ip');
const notepadText = document.getElementById('notepad-text');

// 按钮
const openHackerToolBtn = document.getElementById('open-hacker-tool');
const openNotepadToolBtn = document.getElementById('open-notepad-tool');
const hackBtn = document.getElementById('hack-btn');
const clearIpBtn = document.getElementById('clear-ip');
const saveNotepadBtn = document.getElementById('save-notepad');
const clearNotepadBtn = document.getElementById('clear-notepad');

// 提示
const toast = document.getElementById('message-toast');
const toastMessage = document.getElementById('toast-message');

// ===== 对话配置 =====
const dialogues = [
    {
        sender: 'roland',
        message: 'Amy，我们接到了一个新委托，委托人拜托我们调查她的妹妹的下落。你刚入行没多久，我会帮你一起完成。'
    },
    {
        sender: 'roland', 
        message: '今天是2026年9月17日，一位名叫Hani的女性向我们希望侦探社递交了调查委托：关于她的妹妹Lily的失踪案调查。'
    },
    {
        sender: 'roland',
        message: 'Lily最后一次与Hani联系是在2026年8月31日，自9月起再无音讯。警察对这起失踪案调查进度缓慢，所以心急的Hani找上了我们希望侦探社，希望我们能帮她找到失踪的妹妹。'
    },
    {
        sender: 'roland',
        message: 'Hani告诉我，最后一次Lily给她发的消息内容为：<strong><em>"我将度过有史以来最快乐的一次假期。"</em></strong>'
    },
    {
        sender: 'roland',
        message: '除此之外，Hani还向我提供了Lily的电脑IP地址：<strong><em>188.444.2</em></strong>'
    },
    {
        sender: 'roland',
        message: '我们希望侦探社向员工提供了独家<strong>黑客软件</strong>，可通过电脑IP地址黑入对方电脑。在内网开始你调查的第一步吧，Amy。如果有需要记录的关键信息，也可以使用内网的<strong>记事本</strong>功能。'
    }
];

// ===== 工具函数 =====
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function addMessage(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    const time = getCurrentTime();
    messageDiv.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-time">${time}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

function showToast(message, duration = 3000) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function saveGameState() {
    localStorage.setItem('detectiveGameState', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('detectiveGameState');
    if (saved) {
        const savedState = JSON.parse(saved);
        gameState.notepadContent = savedState.notepadContent || '';
        gameState.chatStep = savedState.chatStep || 0;
        gameState.currentSection = savedState.currentSection || 'chat';
        if (notepadText) {
            notepadText.value = gameState.notepadContent || '';
        }
    }
}

function showDialogues() {
    if (gameState.chatStep < dialogues.length) {
        const dialogue = dialogues[gameState.chatStep];
        setTimeout(() => {
            addMessage(dialogue.sender, dialogue.message);
            gameState.chatStep++;
            saveGameState();
            if (gameState.chatStep < dialogues.length) {
                showDialogues();
            }
        }, 1500);
    }
}

function clearNotificationBadge() {
    if (rolandBadge) {
        rolandBadge.style.display = 'none';
    }
    if (gameState.fromDesktop && window.parent !== window) {
        try {
            window.parent.postMessage({ type: 'notificationCleared', from: 'detective' }, '*');
        } catch (error) {
            console.log('无法发送消息到父窗口:', error);
        }
    }
}

function loadFromDesktop() {
    gameState.fromDesktop = true;
    introPage.classList.remove('active');
    chatPage.classList.add('active');
    gameState.currentPage = 'chat';
    if (chatMessages) chatMessages.innerHTML = '';
    clearNotificationBadge();
    dialogues.forEach(dialogue => addMessage(dialogue.sender, dialogue.message));
    gameState.chatStep = dialogues.length;
    saveGameState();
}

function adjustPageForIframe() {
    const returnDesktopBtn = document.getElementById('return-desktop-btn');
    if (returnDesktopBtn) returnDesktopBtn.style.display = 'none';
    const chatPage = document.getElementById('chat-page');
    if (chatPage) {
        chatPage.style.width = '100%';
        chatPage.style.height = '100%';
    }
    const detectiveNetContainer = document.querySelector('.detective-net-container');
    if (detectiveNetContainer) {
        detectiveNetContainer.style.height = '100%';
        detectiveNetContainer.style.width = '100%';
        detectiveNetContainer.style.minHeight = 'auto';
    }
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.height = 'calc(100vh - 60px)';
        mainContent.style.overflow = 'auto';
    }
    const chatLayout = document.querySelector('.chat-layout');
    if (chatLayout) chatLayout.style.height = '100%';
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.style.maxHeight = 'calc(100vh - 200px)';
        chatMessages.style.overflow = 'auto';
    }
    try {
        window.parent.postMessage({ type: 'pageLoaded', from: 'detective', height: document.body.scrollHeight }, '*');
    } catch (error) {
        console.log('无法发送页面加载消息:', error);
    }
}

// ===== 事件监听器 =====
if (enterDetectiveNetBtn) {
    enterDetectiveNetBtn.addEventListener('click', () => {
        introPage.classList.remove('active');
        chatPage.classList.add('active');
        gameState.currentPage = 'chat';
        saveGameState();
        if (chatMessages) chatMessages.innerHTML = '';
        gameState.chatStep = 0;
        clearNotificationBadge();
        setTimeout(() => showDialogues(), 500);
    });
}

menuItems.forEach(item => {
    item.addEventListener('click', function() {
        const target = this.dataset.target;
        menuItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === `${target}-section`) {
                section.classList.add('active');
            }
        });
        gameState.currentSection = target;
        saveGameState();
    });
});

if (openHackerToolBtn) {
    openHackerToolBtn.addEventListener('click', () => openModal(hackerModal));
}

if (clearIpBtn) {
    clearIpBtn.addEventListener('click', () => {
        hackerIpInput.value = '';
        hackerOutput.innerHTML = `
            <div class="output-line">> 希望侦探社专用调查工具 v2.1</div>
            <div class="output-line">> 系统启动完成...</div>
            <div class="output-line">> 等待输入IP地址...</div>
        `;
    });
}

if (hackBtn) {
    hackBtn.addEventListener('click', () => {
        const ip = hackerIpInput.value.trim();
        if (ip === '188.444.2') {
            hackerOutput.innerHTML = `
                <div class="output-line">> 正在连接 ${ip}...</div>
                <div class="output-line">> 绕过防火墙... 成功</div>
                <div class="output-line">> 建立安全连接...</div>
                <div class="output-line">> 连接成功！获得Lily电脑访问权限</div>
                <div class="output-line">> 准备进入桌面系统...</div>
            `;
            hackerOutput.scrollTop = hackerOutput.scrollHeight;
            setTimeout(() => {
                showToast('成功连接到目标电脑！即将进入桌面系统...', 3000);
                setTimeout(() => window.location.href = 'lily-desktop.html?from=hacker', 3000);
            }, 3000);
        } else {
            hackerOutput.innerHTML += `
                <div class="output-line">> 错误：IP地址无效</div>
                <div class="output-line">> 请检查IP地址输入是否正确</div>
                <div class="output-line">> 正确格式示例：188.444.2</div>
            `;
            hackerOutput.scrollTop = hackerOutput.scrollHeight;
            showToast('IP地址错误，请检查输入是否正确', 3000);
        }
    });
}

if (openNotepadToolBtn) {
    openNotepadToolBtn.addEventListener('click', () => openModal(notepadModal));
}

if (saveNotepadBtn) {
    saveNotepadBtn.addEventListener('click', () => {
        gameState.notepadContent = notepadText.value;
        saveGameState();
        showToast('记事本已保存', 2000);
    });
}

if (clearNotepadBtn) {
    clearNotepadBtn.addEventListener('click', () => {
        if (confirm('确定要清空记事本内容吗？')) {
            notepadText.value = '';
            gameState.notepadContent = '';
            saveGameState();
            showToast('记事本已清空', 2000);
        }
    });
}

document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        const modal = this.closest('.detective-modal');
        closeModal(modal);
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('detective-modal')) {
        closeModal(e.target);
    }
});

window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'clearNotification') {
        clearNotificationBadge();
        try {
            window.parent.postMessage({ type: 'notificationCleared', from: 'detective' }, '*');
        } catch (error) {
            console.log('无法发送消息到父窗口:', error);
        }
    }
});

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('私家侦探社游戏初始化...');
    loadGameState();
    const isInIframe = window !== window.parent;
    const returnFromDesktop = sessionStorage.getItem('returnFromDesktop');
    if (returnFromDesktop === 'true') {
        introPage.classList.remove('active');
        chatPage.classList.add('active');
        gameState.currentPage = 'chat';
        if (chatMessages) chatMessages.innerHTML = '';
        dialogues.forEach(dialogue => addMessage(dialogue.sender, dialogue.message));
        gameState.chatStep = dialogues.length;
        saveGameState();
        clearNotificationBadge();
        sessionStorage.removeItem('returnFromDesktop');
    } else if (isInIframe) {
        loadFromDesktop();
        setTimeout(adjustPageForIframe, 100);
    } else {
        introPage.classList.add('active');
        chatPage.classList.remove('active');
        if (rolandBadge) rolandBadge.style.display = 'flex';
    }
    if (hackerOutput) {
        hackerOutput.innerHTML = `
            <div class="output-line">> 希望侦探社专用调查工具 v2.1</div>
            <div class="output-line">> 系统启动完成...</div>
            <div class="output-line">> 等待输入IP地址...</div>
        `;
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.detective-modal.active').forEach(modal => closeModal(modal));
        }
        if (e.key === 'Enter' && document.activeElement === hackerIpInput) {
            if (hackBtn) hackBtn.click();
        }
        if (e.ctrlKey && e.key === 's' && notepadText && document.activeElement === notepadText) {
            e.preventDefault();
            if (saveNotepadBtn) saveNotepadBtn.click();
        }
    });
    if (hackerIpInput) {
        hackerIpInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9.]/g, '');
            const parts = this.value.split('.');
            if (parts.length > 4) {
                this.value = parts.slice(0, 4).join('.');
            }
        });
    }
});