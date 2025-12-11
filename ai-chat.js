const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.sidebar');
const container = document.querySelector('.container');

if (sidebarToggle && sidebar && container) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    container.classList.toggle('sidebar-collapsed');
  });
}

let chatMessages = [];
let acceptedPolicy = false;
let attachedFiles = [];

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function addMessage(text, isUser = false) {
  const chatMessagesContainer = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
  
  const avatar = isUser ? '👤' : '🤖';
  
  messageDiv.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">
      <div class="message-text">
        <p>${text}</p>
      </div>
      <div class="message-time">${getCurrentTime()}</div>
    </div>
  `;
  
  chatMessagesContainer.appendChild(messageDiv);
  
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  
  chatMessages.push({
    text,
    isUser,
    timestamp: new Date().toISOString()
  });
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  
  if (!text && attachedFiles.length === 0) return;
  
  if (!acceptedPolicy) {
    alert('Please accept or reject the privacy policy first.');
    return;
  }
  
  if (text) {
    addMessage(text, true);
  }
  
  if (attachedFiles.length > 0) {
    const fileNames = attachedFiles.map(f => f.name).join(', ');
    addMessage(`📎 Attached files: ${fileNames}`, true);
  }
  
  input.value = '';
  input.style.height = 'auto';
  
  clearAttachedFiles();
  
  showTypingIndicator();
  
  setTimeout(() => {
    hideTypingIndicator();
    generateAIResponse(text);
  }, 1500);
}

function showTypingIndicator() {
  const chatMessagesContainer = document.getElementById('chatMessages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message assistant-message';
  typingDiv.id = 'typingIndicator';
  
  typingDiv.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content">
      <div class="message-text">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  `;
  
  chatMessagesContainer.appendChild(typingDiv);
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function hideTypingIndicator() {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

function generateAIResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  let response = '';
  
  if (lowerMessage.includes('document') || lowerMessage.includes('summarize')) {
    response = 'I can help you summarize documents. Based on the recent documents in the system, there are 7 items including application forms, contracts, and project documents. Would you like me to provide details about specific documents?';
  } else if (lowerMessage.includes('pending') || lowerMessage.includes('approval')) {
    response = 'Currently, there are 2 pending items requiring approval: R0006 (VC507 Continued Tarbell) and R0002 (Partners_Certific.Local). Would you like to review these items?';
  } else if (lowerMessage.includes('form')) {
    response = 'I found information about Forms B, P, A, and C. Form B has 10 pending items, Form P has 8 pending items, Form A has 6 pending items, and Form C has 4 pending items. Which form would you like to explore?';
  } else if (lowerMessage.includes('help')) {
    response = 'I can assist you with:<br>• Searching and filtering documents<br>• Analyzing form statuses<br>• Finding pending approvals<br>• Providing system navigation help<br>• Summarizing document information<br><br>What would you like help with?';
  } else if (lowerMessage.includes('search')) {
    response = 'I can help you search through the document management system. You can search by document number, name, project, folder path, or status. What would you like to search for?';
  } else {
    response = 'I understand your question. I\'m here to help with document management, form analysis, and system navigation. Could you provide more details about what you\'d like to know?';
  }
  
  addMessage(response, false);
}

function handleKeyDown(event) {
  const input = event.target;
  
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
    return;
  }
  
  setTimeout(() => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  }, 0);
}

function acceptPolicy() {
  acceptedPolicy = true;
  const welcomeMessage = document.querySelector('.assistant-message');
  if (welcomeMessage) {
    welcomeMessage.querySelector('.message-actions').innerHTML = 
      '<p style="color: #4caf50; font-weight: 600; margin: 0;">✓ Policy Accepted</p>';
  }
  addMessage('Thank you for accepting the privacy policy. How can I assist you today?', false);
}

function rejectPolicy() {
  const welcomeMessage = document.querySelector('.assistant-message');
  if (welcomeMessage) {
    welcomeMessage.querySelector('.message-actions').innerHTML = 
      '<p style="color: #f44336; font-weight: 600; margin: 0;">✗ Policy Rejected - Chat functionality is limited</p>';
  }
  addMessage('You have chosen to reject the privacy policy. Please note that chat functionality will be limited. You can still view information but cannot interact with the AI assistant.', false);
}

function clearChat() {
  if (confirm('Are you sure you want to clear the chat history?')) {
    const chatMessagesContainer = document.getElementById('chatMessages');
    chatMessagesContainer.innerHTML = '';
    chatMessages = [];
    acceptedPolicy = false;
    
    location.reload();
  }
}

function exportChat() {
  if (chatMessages.length === 0) {
    alert('No messages to export.');
    return;
  }
  
  const chatText = chatMessages.map(msg => {
    const sender = msg.isUser ? 'User' : 'AI Assistant';
    return `[${new Date(msg.timestamp).toLocaleString()}] ${sender}: ${msg.text}`;
  }).join('\n\n');
  
  const blob = new Blob([chatText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function insertQuickMessage(message) {
  const input = document.getElementById('messageInput');
  input.value = message;
  input.focus();
}

function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  
  files.forEach(file => {
    if (!attachedFiles.find(f => f.name === file.name)) {
      attachedFiles.push(file);
    }
  });
  
  updateFilePreview();
  event.target.value = '';
}

function updateFilePreview() {
  const filePreviewArea = document.getElementById('filePreviewArea');
  
  if (attachedFiles.length === 0) {
    filePreviewArea.style.display = 'none';
    filePreviewArea.innerHTML = '';
    return;
  }
  
  filePreviewArea.style.display = 'flex';
  filePreviewArea.innerHTML = attachedFiles.map((file, index) => `
    <div class="file-preview-item">
      <span class="file-icon">📄</span>
      <span class="file-name">${file.name}</span>
      <button class="file-remove" onclick="removeFile(${index})">×</button>
    </div>
  `).join('');
}

function removeFile(index) {
  attachedFiles.splice(index, 1);
  updateFilePreview();
}

function clearAttachedFiles() {
  attachedFiles = [];
  updateFilePreview();
}

function toggleEmojiPicker() {
  alert('Emoji picker feature coming soon! 😊');
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('messageInput');
  if (input) {
    input.focus();
  }
});
