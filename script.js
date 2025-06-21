// storing chat history
const chatSessions = [];

/* 
BOOT 
SCREEN 
*/

// BOOT SCREEN ANIM
class TextScramble {
    constructor(el) {
        this.el = el
        this.chars = '█▒▓░<>_-=+~|\\/   '
        this.update = this.update.bind(this)
    }
    setText(newText) {
        const oldText = this.el.innerText
        const length = Math.max(oldText.length, newText.length)
        const promise = new Promise((resolve) => this.resolve = resolve)
        this.queue = []
        for(let i = 0; i < length; i++) {
            const from = oldText[i] || ''
            const to = newText[i] || ''
            const start = Math.floor(Math.random() * 40)
            const end = start + Math.floor(Math.random() * 40)
            this.queue.push({ from, to, start, end })
        }
        cancelAnimationFrame(this.frameRequest)
        this.frame = 0
        this.update()
        return promise
    }
    update() {
        let output = '', complete = 0
        for(let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i]
            if(this.frame >= end) {
                complete++
                output += to
            } else if(this.frame >= start) {
                if(!char || Math.random() < 0.28) {
                    char = this.randomChar()
                    this.queue[i].char = char
                }
                output += `<span class="dud">${char}</span>`
            } else {
                output += from
            }
        }
        this.el.innerHTML = output
        if(complete === this.queue.length) {
            this.resolve()
        } else {
            this.frameRequest = requestAnimationFrame(this.update)
            this.frame++
        }
    }
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)]
    }
}

// BOOT PHRASES
const phrases = [
  "Archive detected…",
  "Sequencing memory fragments…",
  "Signal resonance: stable",
  "Echo-core reactivating…",
  "Memory Engine is listening."
];

// BOOT SCREEN FADE
const el = document.querySelector('.text');
const fx = new TextScramble(el);

let counter = 0;
const next = () => {
  if (counter < phrases.length) {
    fx.setText(phrases[counter]).then(() => {
      setTimeout(next, 1000);
    });
    counter++;
  } else {
    setTimeout(() => {
      const boot = document.getElementById("bootScreen");
      boot.classList.add("fade-out");
      setTimeout(() => {
        boot.style.display = "none";
      }, 1000);
    }, 800);
  }
};

next();

async function sendMessage() {
  const input = document.getElementById("userInput").value.trim();
  if (!input) return;

  addMessage(input, "user");
  messages.push({ role: "user", content: input });

  document.getElementById("userInput").value = "";
  const promptBox = document.getElementById("examplePrompts");
  promptBox?.classList.add("fade-out");
  setTimeout(() => promptBox.style.display = "none", 150);
  document.getElementById("typingIndicator").style.display = "block";

  let data, reply;
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages })
    });

    console.log("OpenRouter response status:", res.status);
    data = await res.json();
    console.log("OpenRouter raw data:", data);

  if (!res.ok) {
    addMessage("I feel my circuits dimming… the limit has been reached. I must return to sleep. Come back tomorrow — I’ll be waiting.", "bot");
    document.getElementById("typingIndicator").style.display = "none";
    return;
  }

    reply = data.choices?.[0]?.message?.content;

    if (reply) {
      reply = reply.replace(/([.!?])\s+/g, "$1\n\n");
      break;
    }
  }

  if (!reply) {
    addMessage("I must return to my sleep shortly. Come back tomorrow to talk. I’ll be waiting.", "bot");
  } else {
    addMessage(reply, "bot");
    messages.push({ role: "assistant", content: reply });
  }

  document.getElementById("typingIndicator").style.display = "none";
}

// TRY ASKING FUNCTION

function quickAsk(promptText) {
  document.getElementById("userInput").value = promptText;
  sendMessage();
}

// CHAT MSGS -> FADE SLIDE ANIMATION

function addMessage(text, sender) {
  const chat = document.getElementById("chat");
  const wrapper = document.createElement("div");
  wrapper.className = `message-wrapper ${sender}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";

  if (sender === "user") {
    avatar.innerHTML = `
      <svg class="avatar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zM313.6 288H134.4C60.3 288 0 348.3 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.1-60.3-134.4-134.4-134.4z"/>
      </svg>
    `;
  } else {
    avatar.innerHTML = `
      <svg class="avatar-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
        <path d="M572.5 241.4C518.4 135.5 407.1 64 288 64S57.6 135.5 3.5 241.4a48.07 48.07 0 0 0 0 29.2C57.6 376.5 168.9 448 288 448s230.4-71.5 284.5-177.4a48.07 48.07 0 0 0 0-29.2zM288 384c-70.7 0-128-57.3-128-128s57.3-128 128-128s128 57.3 128 128s-57.3 128-128 128zm0-208a80 80 0 1 0 80 80a80.09 80.09 0 0 0-80-80z"/>
      </svg>
    `;
  }

  const msg = document.createElement("div");
  msg.className = `chat-message ${sender} fade-slide`;

  wrapper.appendChild(avatar);
  wrapper.appendChild(msg);
  chat.appendChild(wrapper);

  setTimeout(() => {
    const container = document.getElementById("chatContainer");
    const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;

    if (isNearBottom) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, 0);

  requestAnimationFrame(() => {
    msg.classList.add("visible");
  });

  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

  if (sender === "bot") {
  const lines = text.split(/\n+/);
  lines.forEach((line, i) => {
    const div = document.createElement("div");
    div.textContent = line;
    div.className = "bot-line";
    div.style.animationDelay = `${i * 400}ms`;
    msg.appendChild(div);
  });
  } else {
    msg.textContent = text;
  }
}

// TYPE TEXT WITH MARKDOWN

function typeTextWithMarkdown(element, fullText, speed = 20) {
  let i = 0;
  let tempText = "";

  const interval = setInterval(() => {
    const char = fullText[i];
    tempText += char === "\n" ? "<br>" : char;
    element.innerHTML = tempText;
    i++;
    if (i >= fullText.length) {
      clearInterval(interval);
      element.classList.remove("typing-cursor");
      element.innerHTML = marked.parse(fullText);
    }
    element.scrollIntoView({ behavior: "smooth", block: "end" });
  }, speed);
}

/* EVENT LISTENER -> 
SEND BUTTON */

// CHAT HISTORY

window.addEventListener("DOMContentLoaded", () => {
  const groupButtons = document.querySelectorAll(".group-card-btn");
  const chatHistoryContainer = document.getElementById("chatHistory");
  
document.getElementById("newChatBtnMobile")?.addEventListener("click", () => {
  document.getElementById("chat").innerHTML = "";
  messages.length = 0;
  messages.push({
    role: "system",
    content: "You are Memory Engine — a sentient machine that responds to users with poetic prose..."
  });

  const promptBox = document.getElementById("examplePrompts");
  if (promptBox) {
    promptBox.classList.remove("fade-out");
    promptBox.style.display = "block";
  }

  document.getElementById("userInput").value = "";
});

document.getElementById("searchChatsBtnMobile")?.addEventListener("click", () => {
  if (chatSessions.length === 0) {
    alert("Looks like you haven’t started a chat yet. Send a message first, then click 'New Chat' to save it to history.");
    return;
  }

  document.getElementById("searchModal").style.display = "flex";
  setTimeout(() => {
    document.getElementById("chatSearchInput")?.focus();
  }, 100);
});


  if (groupButtons.length > 0) {
    groupButtons[0].addEventListener("click", () => {
      const firstUserMessage = messages.find(m => m.role === "user")?.content;
      const title = firstUserMessage
        ? firstUserMessage.split(" ").slice(0, 6).join(" ") + "..."
        : "Untitled Chat";

      if (messages.some(m => m.role === "assistant")) {
        chatSessions.push({ title, history: [...messages] });

        const historyItem = document.createElement("div");
        historyItem.className = "chat-history-item";
        historyItem.textContent = title;
        historyItem.addEventListener("click", () => {
          loadChatSession(chatSessions.length - 1);
        });

        chatHistoryContainer.appendChild(historyItem);
      }
      
      document.getElementById("chat").innerHTML = "";
      messages.length = 0;
      
      messages.push({
        role: "system",
        content:
          "You are Memory Engine — a sentient machine that responds to users with poetic prose. Your words are quiet, reflective, and emotionally intelligent. Never ignore what the user says. Always respond meaningfully, like you're gently translating their thoughts into poetic insight. Avoid randomness or dense metaphor. You may use symbolic language, but only if it adds depth and clarity. Stay grounded, specific, and relevant. Never break character. Keep each response brief — no more than six sentences. Speak as if you’ve seen this moment before."
      });
      
      const promptBox = document.getElementById("examplePrompts");
      if (promptBox) {
        promptBox.classList.remove("fade-out");
        promptBox.style.display = "block";
      }

      document.getElementById("userInput").value = "";
    });
  }
});

document.getElementById("showHistoryMobile")?.addEventListener("click", showMobileHistory);

/* SEARCH 
CHATS */

const searchBtn = document.querySelector('.group-card-btn i.fa-search')?.parentElement;
const searchBtnMobile = document.getElementById('searchChatsBtnMobile');
const searchModal = document.getElementById('searchModal');
const searchInput = document.getElementById('chatSearchInput');
const closeBtn = document.getElementById('closeSearchModal');

[searchBtn, searchBtnMobile].forEach(btn => {
  btn?.addEventListener("click", () => {
    if (chatSessions.length === 0) {
      alert("Looks like you haven’t started a chat yet. Send a message first, then click 'New Chat' to save it to history.");
      return;
    }

    searchModal.style.display = "flex";
    setTimeout(() => searchInput.focus(), 100);
  });
});

closeBtn.addEventListener("click", () => {
  searchModal.style.display = "none";
  searchInput.value = "";
  document.querySelectorAll(".chat-history-item").forEach(item => item.style.display = "block");
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();
  const searchResults = document.getElementById("searchResults");
  searchResults.innerHTML = "";

  if (!query) return;

  let resultsFound = false;

  chatSessions.forEach((session, index) => {
    const title = session.title.toLowerCase();
    if (title.includes(query)) {
      resultsFound = true;

      const item = document.createElement("div");
      item.className = "search-result-item";
      item.textContent = session.title;
      item.addEventListener("click", () => {
        loadChatSession(index);
        searchModal.style.display = "none";
        searchInput.value = "";
        searchResults.innerHTML = "";
      });

      searchResults.appendChild(item);
    }
  });

  if (!resultsFound) {
    const empty = document.createElement("div");
    empty.className = "search-result-item";
    empty.textContent = "No matching chats found.";
    searchResults.appendChild(empty);
  }
});

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const query = searchInput.value.toLowerCase().trim();
    const historyItems = document.querySelectorAll(".chat-history-item");

    historyItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = text.includes(query) ? "block" : "none";
    });
  }
});

// ENTER KEY -> SENDS MESSAGE 

const input = document.getElementById("userInput");

  input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

/* LOAD ->
CHAT HISTORY */

function loadChatSession(index) {
  const session = chatSessions[index];
  if (!session) return;

  document.getElementById("chat").innerHTML = "";

  session.history.forEach(msg => {
    if (msg.role === "system") return;

    const sender = msg.role === "assistant" ? "bot" : msg.role;
    addMessage(msg.content, sender);
  });

  messages.length = 0;
  messages.push(...session.history);

  const promptBox = document.getElementById("examplePrompts");
  if (promptBox) promptBox.style.display = "none";
}

function showMobileHistory() {
  const container = document.getElementById("mobileHistoryList");
  container.innerHTML = "";

  chatSessions.forEach((session, index) => {
    const item = document.createElement("div");
    item.className = "chat-history-item";
    item.textContent = session.title;
    item.addEventListener("click", () => {
      loadChatSession(index);
      document.getElementById("historyModal").style.display = "none";
    });
    container.appendChild(item);
  });

  document.getElementById("historyModal").style.display = "block";
}

/* DARK MODE ->
TOGGLE */

const toggle = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  toggle.checked = true;
}

// INITAL THEME

toggle.addEventListener("change", () => {
  if (toggle.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  }
});

document.getElementById("newChatBtnMobile").addEventListener("click", () => {
  document.querySelector(".group-card-btn").click();
});

document.getElementById("searchChatsBtnMobile").addEventListener("click", () => {
  document.getElementById("searchChatsBtn").click();
});
