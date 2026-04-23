if (!document.querySelector(".chatbot-toggler")) {
    document.body.insertAdjacentHTML(
        "beforeend",
        `
        <button class="chatbot-toggler" type="button" aria-label="Open chatbot">
            <span class="bot-3d-stage bot-3d-icon" data-bot-3d="icon">
                <img class="bot-3d-fallback" src="IIRIS_LOGO.png" alt="Open chatbot">
            </span>
        </button>
        <div class="chatbot-container">
            <div class="chatbot-mascot" aria-hidden="true">
                <div class="bot-3d-stage bot-3d-mascot" data-bot-3d="mascot">
                    <img class="bot-3d-fallback" src="IIRIS_LOGO.png" alt="">
                </div>
            </div>
            <header class="chatbot-header">
                <h2>AI Assistant</h2>
                <span class="chat-close-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </span>
            </header>
            <ul class="chatbox">
                <li class="chat incoming">
                    <img class="chatbot-avatar" src="IIRIS_LOGO.png" alt="IIRIS assistant">
                    <div class="message-content">
                        <div class="chat-message">
                            <p>&#128075; Welcome to IIRIS.</p>
                            <p>Here to help with information on our:</p>
                            <ul>
                                <li>Services</li>
                                <li>Leadership</li>
                                <li>Locations</li>
                                <li>Press releases</li>
                                <li>Media presence</li>
                                <li>Contact information and more.</li>
                            </ul>
                            <p>How may I assist you today?</p>
                        </div>
                    </div>
                </li>
            </ul>
            <div class="chat-input">
                <textarea placeholder="Enter a message..." spellcheck="false" required></textarea>
                <span id="send-btn">&#10148;</span>
            </div>
        </div>
    `
    );
}

const chatbotToggler = document.querySelector(".chatbot-toggler");
const chatCloseBtn = document.querySelector(".chat-close-btn");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.getElementById("send-btn");
const chatbox = document.querySelector(".chatbox");
const chatbotContainer = document.querySelector(".chatbot-container");
const CHAT_HISTORY_KEY = "chat_history";
const API_BASE_URL = "http://127.0.0.1:10000";
const CHAT_USER_ID_KEY = "iiris_chatbot_user_id";

const getChatbotUserId = () => {
    let userId = localStorage.getItem(CHAT_USER_ID_KEY);
    if (!userId) {
        userId = window.crypto && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`;
        localStorage.setItem(CHAT_USER_ID_KEY, userId);
    }
    return userId;
};

let chatbotUserId = getChatbotUserId();

const createBotModel = () => {
    const { THREE } = window;
    const mascot = new THREE.Group();

    const shellMaterial = new THREE.MeshStandardMaterial({
        color: 0x8d8cff,
        metalness: 0.28,
        roughness: 0.22,
        emissive: 0x17174a,
        emissiveIntensity: 0.12,
    });
    const faceMaterial = new THREE.MeshStandardMaterial({
        color: 0xf8fbff,
        metalness: 0.08,
        roughness: 0.2,
    });
    const accentMaterial = new THREE.MeshStandardMaterial({
        color: 0x5f63ff,
        metalness: 0.35,
        roughness: 0.18,
        emissive: 0x151b66,
        emissiveIntensity: 0.22,
    });
    const helperMaterial = new THREE.MeshStandardMaterial({
        color: 0x67e8f9,
        metalness: 0.12,
        roughness: 0.16,
        emissive: 0x0b7285,
        emissiveIntensity: 0.35,
    });
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x111827,
        metalness: 0.05,
        roughness: 0.16,
        emissive: 0x0b102c,
        emissiveIntensity: 0.35,
    });
    const glowMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.05,
        roughness: 0.16,
        emissive: 0x6d6dee,
        emissiveIntensity: 0.55,
    });
    const bubbleMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.05,
        roughness: 0.2,
        transparent: true,
        opacity: 0.9,
        emissive: 0x343a90,
        emissiveIntensity: 0.08,
    });

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 40, 28), shellMaterial);
    body.scale.set(0.9, 0.92, 0.72);
    body.position.y = -0.34;
    mascot.add(body);

    const helperBadge = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), helperMaterial);
    helperBadge.scale.set(1.15, 0.68, 0.24);
    helperBadge.position.set(0, -0.26, 0.56);
    mascot.add(helperBadge);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 44, 30), shellMaterial);
    head.scale.set(1.02, 0.92, 0.76);
    head.position.y = 0.36;
    mascot.add(head);

    const face = new THREE.Mesh(new THREE.SphereGeometry(0.51, 40, 20), faceMaterial);
    face.scale.set(1.18, 0.64, 0.18);
    face.position.set(0, 0.36, 0.56);
    mascot.add(face);

    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 20, 14), eyeMaterial);
    leftEye.position.set(-0.2, 0.44, 0.66);
    mascot.add(leftEye);

    const rightEye = leftEye.clone();
    rightEye.position.x = 0.2;
    mascot.add(rightEye);

    const smile = new THREE.Mesh(
        new THREE.TorusGeometry(0.17, 0.012, 10, 40, Math.PI),
        helperMaterial
    );
    smile.position.set(0, 0.25, 0.68);
    smile.rotation.set(0, 0, Math.PI);
    mascot.add(smile);

    const headsetBand = new THREE.Mesh(
        new THREE.TorusGeometry(0.68, 0.025, 12, 72, Math.PI * 1.15),
        accentMaterial
    );
    headsetBand.position.set(0, 0.4, 0.04);
    headsetBand.rotation.set(0.08, 0, Math.PI * 0.93);
    mascot.add(headsetBand);

    const leftEarCup = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 16), accentMaterial);
    leftEarCup.scale.set(0.62, 1, 1);
    leftEarCup.position.set(-0.72, 0.35, 0.05);
    mascot.add(leftEarCup);

    const rightEarCup = leftEarCup.clone();
    rightEarCup.position.x = 0.72;
    mascot.add(rightEarCup);

    const micBoom = new THREE.Mesh(
        new THREE.CylinderGeometry(0.017, 0.022, 0.48, 16),
        accentMaterial
    );
    micBoom.position.set(0.5, 0.12, 0.48);
    micBoom.rotation.set(1.15, 0.15, -0.72);
    mascot.add(micBoom);

    const micTip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 18, 12), helperMaterial);
    micTip.position.set(0.3, 0.03, 0.66);
    mascot.add(micTip);

    const leftArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.07, 0.46, 18),
        accentMaterial
    );
    leftArm.position.set(-0.6, -0.16, 0.08);
    leftArm.rotation.z = -0.78;
    mascot.add(leftArm);

    const rightArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.07, 0.52, 18),
        accentMaterial
    );
    rightArm.position.set(0.61, 0.02, 0.08);
    rightArm.rotation.z = 0.95;
    mascot.add(rightArm);

    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 14), helperMaterial);
    leftHand.position.set(-0.78, -0.34, 0.12);
    mascot.add(leftHand);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.095, 20, 14), helperMaterial);
    rightHand.position.set(0.82, 0.22, 0.12);
    mascot.add(rightHand);

    const bubbleGroup = new THREE.Group();
    const bubblePanel = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.28, 0.045),
        bubbleMaterial
    );
    bubblePanel.position.set(0.96, 0.68, 0.2);
    bubbleGroup.add(bubblePanel);

    const bubbleTail = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 3), bubbleMaterial);
    bubbleTail.position.set(0.72, 0.54, 0.2);
    bubbleTail.rotation.set(0, 0, -0.92);
    bubbleGroup.add(bubbleTail);

    const dotOne = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 8), accentMaterial);
    dotOne.position.set(0.84, 0.68, 0.24);
    bubbleGroup.add(dotOne);

    const dotTwo = dotOne.clone();
    dotTwo.position.x = 0.96;
    bubbleGroup.add(dotTwo);

    const dotThree = dotOne.clone();
    dotThree.position.x = 1.08;
    bubbleGroup.add(dotThree);
    mascot.add(bubbleGroup);

    const helperOrb = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.08, 1),
        helperMaterial
    );
    helperOrb.position.set(-0.72, 0.72, 0.22);
    mascot.add(helperOrb);

    const platform = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.03, 12, 72), glowMaterial);
    platform.position.y = -0.86;
    platform.rotation.x = Math.PI / 2;
    mascot.add(platform);

    mascot.userData = {
        leftArm,
        rightArm,
        rightHand,
        micTip,
        helperOrb,
        platform,
        bubbleGroup,
    };

    return mascot;
};

const initChatbot3D = () => {
    if (!window.THREE) return;

    document.querySelectorAll("[data-bot-3d]").forEach((stage) => {
        if (stage.dataset.threeReady === "true") return;
        stage.dataset.threeReady = "true";

        const { THREE } = window;
        const isMascot = stage.dataset.bot3d === "mascot";
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        const bot = createBotModel();
        const clock = new THREE.Clock();
        let restBlend = 0;

        camera.position.set(0, 0.08, isMascot ? 4.05 : 4.35);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.domElement.setAttribute("aria-hidden", "true");
        stage.appendChild(renderer.domElement);
        stage.classList.add("is-3d-ready");

        bot.scale.setScalar(isMascot ? 1.18 : 1.02);
        scene.add(bot);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
        const rimLight = new THREE.DirectionalLight(0x9d9dff, 1.1);
        keyLight.position.set(2.4, 2.8, 4);
        rimLight.position.set(-2, 1.6, -2.6);
        scene.add(ambientLight, keyLight, rimLight);

        const resizeRenderer = () => {
            const width = Math.max(1, stage.clientWidth);
            const height = Math.max(1, stage.clientHeight);
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        const animate = () => {
            const time = clock.getElapsedTime();
            const shouldRest = !isMascot && document.body.classList.contains("show-chatbot");
            restBlend += ((shouldRest ? 1 : 0) - restBlend) * 0.08;
            const motionScale = isMascot ? 1 : 1 - restBlend;
            const trickBoost = isMascot ? 1.35 : 0.9;
            const { leftArm, rightArm, rightHand, micTip, helperOrb, platform, bubbleGroup } =
                bot.userData;

            bot.position.y = Math.sin(time * 2.1) * (isMascot ? 0.1 : 0.05) * motionScale;
            bot.rotation.x = Math.sin(time * 1.4) * 0.08 * motionScale;
            bot.rotation.y = Math.sin(time * 1.05) * (isMascot ? 0.34 : 0.24) * motionScale;
            bot.rotation.z = Math.sin(time * 1.8) * 0.08 * motionScale;

            leftArm.rotation.z = -0.78 + Math.sin(time * 2.6) * 0.18 * trickBoost * motionScale;
            rightArm.rotation.z = 0.95 + Math.sin(time * 3.4) * 0.32 * trickBoost * motionScale;
            rightHand.position.y = 0.22 + Math.sin(time * 3.4) * 0.08 * trickBoost * motionScale;
            micTip.scale.setScalar(1 + Math.sin(time * 5.2) * 0.12 * motionScale);
            helperOrb.rotation.x += 0.026 * motionScale;
            helperOrb.rotation.y += 0.036 * motionScale;
            helperOrb.position.y = 0.72 + Math.sin(time * 2.8) * 0.08 * motionScale;
            bubbleGroup.position.y = Math.sin(time * 2.2) * 0.04 * motionScale;
            bubbleGroup.scale.setScalar(1 + Math.sin(time * 3.1) * 0.025 * motionScale);
            platform.rotation.z += 0.022 * motionScale;

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        resizeRenderer();
        animate();
        window.addEventListener("resize", resizeRenderer);
    });
};

initChatbot3D();

const renderChatMessage = (element, message, className) => {
    if (!element) return;

    const safeMessage = typeof message === "string" ? message : String(message ?? "");
    element.dataset.rawMessage = safeMessage;

    if (
        className !== "incoming" ||
        typeof marked === "undefined" ||
        typeof DOMPurify === "undefined"
    ) {
        element.textContent = safeMessage;
        return;
    }

    const rawHtml = marked.parse(safeMessage, { breaks: true });
    element.innerHTML = DOMPurify.sanitize(rawHtml);

    element.querySelectorAll("a[href]").forEach((link) => {
        const href = link.getAttribute("href") || "";
        if (/^https?:\/\//i.test(href)) {
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");
        }
    });
};

const saveChatHistory = () => {
    if (!chatbox) return;

    const messages = [];
    chatbox.querySelectorAll(".chat").forEach((chat) => {
        const messageElement = chat.querySelector(".chat-message");
        if (messageElement && messageElement.querySelector(".typing-animation")) return;

        const message = messageElement
            ? messageElement.dataset.rawMessage || messageElement.textContent
            : "";
        const className = chat.classList.contains("outgoing") ? "outgoing" : "incoming";
        const chatId = chat.getAttribute("data-chat-id") || null;
        messages.push({ message, className, chatId });
    });

    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
};

const loadChatHistory = () => {
    if (!chatbox) return;

    const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!storedHistory) return;

    let history;
    try {
        history = JSON.parse(storedHistory);
    } catch (error) {
        console.error("Invalid chat history in localStorage:", error);
        localStorage.removeItem(CHAT_HISTORY_KEY);
        return;
    }

    if (history && history.length > 0) {
        chatbox.innerHTML = "";
        history.forEach((chat) => {
            const chatLi = createChatLi(chat.message, chat.className);
            if (chat.chatId) {
                chatLi.setAttribute("data-chat-id", chat.chatId);
            }
            if (chat.className === "incoming") {
                const feedbackDiv = chatLi.querySelector(".chat-feedback");
                if (feedbackDiv) feedbackDiv.classList.add("active");
            }
            chatbox.appendChild(chatLi);
        });
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }
};

if (chatCloseBtn && chatbox) {
    chatCloseBtn.setAttribute("data-tooltip", "Close");

    const clearChatBtn = document.createElement("span");
    clearChatBtn.textContent = "Clear Chat";
    clearChatBtn.classList.add("clear-chat-btn");
    chatCloseBtn.parentNode.insertBefore(clearChatBtn, chatCloseBtn);

    const expandBtn = document.createElement("span");
    const expandIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5"/><path d="M3 3l7 7"/><path d="M16 3h5v5"/><path d="M21 3l-7 7"/><path d="M8 21H3v-5"/><path d="M3 21l7-7"/><path d="M16 21h5v-5"/><path d="M21 21l-7-7"/></svg>`;
    const collapseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6"/><path d="M10 14l-7 7"/><path d="M20 14h-6v6"/><path d="M14 14l7 7"/><path d="M4 10h6V4"/><path d="M10 10L3 3"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/></svg>`;
    expandBtn.classList.add("expand-btn");
    expandBtn.innerHTML = expandIcon;
    expandBtn.setAttribute("data-tooltip", "Expand");
    chatCloseBtn.parentNode.insertBefore(expandBtn, chatCloseBtn);

    expandBtn.addEventListener("click", () => {
        chatbotContainer.classList.toggle("expanded");
        if (chatbotContainer.classList.contains("expanded")) {
            expandBtn.innerHTML = collapseIcon;
            expandBtn.setAttribute("data-tooltip", "Collapse");
        } else {
            expandBtn.innerHTML = expandIcon;
            expandBtn.setAttribute("data-tooltip", "Expand");
        }
        chatbox.scrollTo(0, chatbox.scrollHeight);
    });

    const chatbotHeader = document.querySelector(".chatbot-header");
    let isDragging = false;
    let startX;
    let startY;
    let startLeft;
    let startTop;

    const onDrag = (event) => {
        if (!isDragging) return;
        chatbotContainer.style.left = `${startLeft + (event.clientX - startX)}px`;
        chatbotContainer.style.top = `${startTop + (event.clientY - startY)}px`;
    };

    const stopDrag = () => {
        isDragging = false;
        chatbotContainer.style.transition = "";
        document.removeEventListener("mousemove", onDrag);
        document.removeEventListener("mouseup", stopDrag);
    };

    if (chatbotHeader) {
        chatbotHeader.addEventListener("mousedown", (event) => {
            if (event.target.closest("span") || event.target.closest("button")) return;
            isDragging = true;
            chatbotContainer.style.transition = "none";

            const rect = chatbotContainer.getBoundingClientRect();
            chatbotContainer.style.right = "auto";
            chatbotContainer.style.bottom = "auto";
            chatbotContainer.style.left = `${rect.left}px`;
            chatbotContainer.style.top = `${rect.top}px`;

            startX = event.clientX;
            startY = event.clientY;
            startLeft = rect.left;
            startTop = rect.top;

            document.addEventListener("mousemove", onDrag);
            document.addEventListener("mouseup", stopDrag);
        });
    }

    const initialChatContent = chatbox.innerHTML;
    clearChatBtn.addEventListener("click", () => {
        localStorage.removeItem(CHAT_HISTORY_KEY);
        localStorage.removeItem(CHAT_USER_ID_KEY);
        chatbotUserId = getChatbotUserId();
        chatbox.innerHTML = initialChatContent;
    });
}

let userMessage = null;

const sendFeedback = (chatId, feedback) => {
    fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            chat_id: chatId,
            feedback: feedback,
        }),
    }).catch((error) => console.error("Error sending feedback:", error));
};

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);

    const chatContent =
        className === "outgoing"
            ? `<div class="chat-message"></div>`
            : `<img class="chatbot-avatar" src="IIRIS_LOGO.png" alt="IIRIS assistant"><div class="message-content"><div class="chat-message"></div><div class="chat-feedback"><button class="feedback-btn like" data-tooltip="Good response"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg></button><button class="feedback-btn dislike" data-tooltip="Bad response"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg></button><button class="feedback-btn copy" data-tooltip="Copy response"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button><span class="feedback-text"></span></div></div>`;

    chatLi.innerHTML = chatContent;
    renderChatMessage(chatLi.querySelector(".chat-message"), message, className);

    if (className === "incoming") {
        const feedbackText = chatLi.querySelector(".feedback-text");
        const likeBtn = chatLi.querySelector(".like");
        const dislikeBtn = chatLi.querySelector(".dislike");
        const copyBtn = chatLi.querySelector(".copy");

        likeBtn.addEventListener("click", () => {
            const chatId = chatLi.getAttribute("data-chat-id");
            if (likeBtn.classList.contains("active")) {
                likeBtn.classList.remove("active");
                feedbackText.textContent = "";
            } else {
                likeBtn.classList.add("active");
                dislikeBtn.classList.remove("active");
                feedbackText.textContent = "Feedback submitted";
                setTimeout(() => {
                    feedbackText.textContent = "";
                }, 2000);
                if (chatId) {
                    sendFeedback(chatId, "like");
                }
            }
        });

        dislikeBtn.addEventListener("click", () => {
            const chatId = chatLi.getAttribute("data-chat-id");
            if (dislikeBtn.classList.contains("active")) {
                dislikeBtn.classList.remove("active");
                feedbackText.textContent = "";
            } else {
                dislikeBtn.classList.add("active");
                likeBtn.classList.remove("active");
                feedbackText.textContent = "Feedback submitted";
                setTimeout(() => {
                    feedbackText.textContent = "";
                }, 2000);
                if (chatId) {
                    sendFeedback(chatId, "dislike");
                }
            }
        });

        copyBtn.addEventListener("click", () => {
            if (copyBtn.classList.contains("active")) {
                copyBtn.classList.remove("active");
                feedbackText.textContent = "";
            } else {
                const text = chatLi.querySelector(".chat-message").textContent;
                navigator.clipboard.writeText(text).then(() => {
                    copyBtn.classList.add("active");
                    feedbackText.textContent = "Response copied";
                    setTimeout(() => {
                        feedbackText.textContent = "";
                    }, 2000);
                });
            }
        });
    }

    return chatLi;
};

const getBackendHistory = () => {
    const chats = Array.from(chatbox.querySelectorAll(".chat"));
    const previousChats = chats.slice(0, -2);

    return previousChats
        .map((chat) => {
            const messageElement = chat.querySelector(".chat-message");
            if (!messageElement || messageElement.querySelector(".typing-animation")) return null;

            const content = messageElement.dataset.rawMessage || messageElement.textContent || "";
            if (!content.trim()) return null;

            return {
                role: chat.classList.contains("outgoing") ? "user" : "assistant",
                content: content.trim(),
            };
        })
        .filter(Boolean)
        .slice(-12);
};

const generateResponse = (chatElement) => {
    const API_URL = `${API_BASE_URL}/ask`;
    const messageElement = chatElement.querySelector(".chat-message");

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "application/json",
        },
        body: JSON.stringify({
            question: userMessage,
            user_id: chatbotUserId,
            history: getBackendHistory(),
            k: 15,
            temperature: 0.7,
        }),
    };

    fetch(API_URL, requestOptions)
        .then((res) => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json();
        })
        .then((data) => {
            const botReply = data.answer || data.response || JSON.stringify(data);
            renderChatMessage(messageElement, botReply, "incoming");
            if (data.chat_id) {
                chatElement.setAttribute("data-chat-id", data.chat_id);
            }
            const feedbackDiv = chatElement.querySelector(".chat-feedback");
            if (feedbackDiv) feedbackDiv.classList.add("active");
            saveChatHistory();
        })
        .catch((error) => {
            console.error("Chatbot Error:", error);
            if (error.message === "Failed to fetch") {
                renderChatMessage(
                    messageElement,
                    "Error: Cannot connect to server. Ensure the backend is running and CORS is enabled.",
                    "incoming"
                );
            } else {
                renderChatMessage(
                    messageElement,
                    "Oops! Something went wrong. Please check the browser console for details.",
                    "incoming"
                );
            }
            const feedbackDiv = chatElement.querySelector(".chat-feedback");
            if (feedbackDiv) feedbackDiv.classList.add("active");
            saveChatHistory();
        })
        .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
};

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = "";
    chatInput.style.height = "auto";

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    saveChatHistory();

    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        const messageElement = incomingChatLi.querySelector(".chat-message");
        messageElement.innerHTML = `<div class="typing-animation">
            <div class="typing-dot" style="--delay: 0.2s"></div>
            <div class="typing-dot" style="--delay: 0.3s"></div>
            <div class="typing-dot" style="--delay: 0.4s"></div>
        </div>`;
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
};

if (chatInput) {
    chatInput.addEventListener("input", () => {
        chatInput.style.height = "auto";
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey && window.innerWidth > 800) {
            event.preventDefault();
            handleChat();
        }
    });
}

if (sendChatBtn) {
    sendChatBtn.addEventListener("click", handleChat);
}

if (chatbotToggler) {
    chatbotToggler.addEventListener("click", () => {
        document.body.classList.toggle("show-chatbot");
    });
}

if (chatCloseBtn) {
    chatCloseBtn.addEventListener("click", () => {
        document.body.classList.remove("show-chatbot");
    });
}

if (chatbox) {
    loadChatHistory();
}

if (!sessionStorage.getItem("chatbotOpened")) {
    setTimeout(() => {
        document.body.classList.add("show-chatbot");
        sessionStorage.setItem("chatbotOpened", "true");
    }, 3000);
}
