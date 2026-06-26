// ============================================
// COMMUNICATION TRAINER - MAIN APPLICATION
// ============================================

/**
 * Event system for loose coupling
 */
class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return () => {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        };
    }

    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(data));
    }

    off(event) {
        delete this.events[event];
    }
}

/**
 * Toast notification system
 */
class ToastManager {
    constructor(containerId = 'data-toast-container') {
        this.container = document.querySelector(`[${containerId}]`);
        this.toasts = [];
    }

    show(message, type = 'info', duration = CONFIG.toast.duration) {
        const id = Math.random().toString(36).substr(2, 9);
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'status');
        
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || '•'}</span>
            <span>${message}</span>
        `;
        
        this.container.appendChild(toast);
        this.toasts.push({ id, element: toast });

        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }

        return id;
    }

    remove(id) {
        const index = this.toasts.findIndex(t => t.id === id);
        if (index > -1) {
            const { element } = this.toasts[index];
            element.style.animation = 'toastSlideOut 200ms ease-out forwards';
            setTimeout(() => {
                element.remove();
                this.toasts.splice(index, 1);
            }, 200);
        }
    }

    success(message) {
        return this.show(message, 'success');
    }

    error(message) {
        return this.show(message, 'error');
    }

    info(message) {
        return this.show(message, 'info');
    }
}

/**
 * Main Communication Trainer Application
 */
class CommunicationTrainer {
    constructor() {
        // State
        this.state = {
            currentCaseIndex: 0,
            appState: 'loading', // loading, ready, error
            error: null,
            solutionShown: false,
            checkedItems: new Set(),
        };

        // Event system
        this.events = new EventEmitter();

        // Toast manager
        this.toast = new ToastManager();

        // Data
        this.cases = CASES;

        // DOM elements
        this.dom = this.cacheDOMElements();

        // Initialize
        this.init();
    }

    /**
     * Cache frequently accessed DOM elements
     */
    cacheDOMElements() {
        return {
            app: document.querySelector('[data-app-root]'),
            layout: document.querySelector('[data-layout]'),
            loadingState: document.querySelector('[data-loading-state]'),
            errorState: document.querySelector('[data-error-state]'),
            errorMessage: document.querySelector('[data-error-message]'),
            errorRetryBtn: document.querySelector('[data-error-retry]'),

            header: document.querySelector('[data-app-header]'),
            currentCaseSpan: document.querySelector('[data-current-case]'),
            totalCasesSpan: document.querySelector('[data-total-cases]'),
            progressFill: document.querySelector('[data-progress-fill]'),

            chatProject: document.querySelector('[data-chat-project]'),
            chatContext: document.querySelector('[data-chat-context]'),
            chatStatus: document.querySelector('[data-chat-status]'),
            messagesContainer: document.querySelector('[data-messages-container]'),

            workspaceTitle: document.querySelector('[data-workspace-title]'),
            workspaceSubtitle: document.querySelector('[data-workspace-subtitle]'),
            instructionText: document.querySelector('[data-instruction-text]'),
            answerInput: document.querySelector('[data-answer-input]'),
            charCurrent: document.querySelector('[data-char-current]'),
            charLimit: document.querySelector('[data-char-limit]'),
            inputHint: document.querySelector('[data-input-hint]'),
            checklistContainer: document.querySelector('[data-checklist-container]'),
            checklistProgress: document.querySelector('[data-checklist-progress]'),

            solutionSection: document.querySelector('[data-solution-section]'),
            solutionContent: document.querySelector('[data-solution-content]'),
            solutionFeedback: document.querySelector('[data-solution-feedback]'),
            solutionCopyBtn: document.querySelector('[data-solution-copy]'),

            showSolutionBtn: document.querySelector('[data-show-solution-btn]'),
            nextCaseBtn: document.querySelector('[data-next-case-btn]'),
            prevCaseBtn: document.querySelector('[data-prev-case-btn]'),

            helpBtn: document.querySelector('[data-help-btn]'),
            helpModal: document.querySelector('[data-help-modal]'),
            modalClose: document.querySelector('[data-modal-close]'),
        };
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.setState({ appState: 'loading' });

            // Validate data
            if (!this.validateCases()) {
                throw new Error('Недопустимая структура кейсов');
            }

            // Setup event listeners
            this.setupEventListeners();

            // Load first case
            this.loadCase(0);

            // Update UI
            this.updateTotalCases();

            // Show main layout
            this.setState({ appState: 'ready' });
            this.showLayout();

            console.log('✅ Application initialized successfully');
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Validate cases data
     */
    validateCases() {
        if (!Array.isArray(this.cases) || this.cases.length === 0) {
            return false;
        }
        return this.cases.every(isValidCase);
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Answer input
        this.dom.answerInput.addEventListener('input', (e) => this.onAnswerInput(e));

        // Buttons
        this.dom.showSolutionBtn.addEventListener('click', () => this.toggleSolution());
        this.dom.nextCaseBtn.addEventListener('click', () => this.nextCase());
        this.dom.prevCaseBtn.addEventListener('click', () => this.previousCase());

        // Help modal
        this.dom.helpBtn.addEventListener('click', () => this.openHelpModal());
        this.dom.modalClose.addEventListener('click', () => this.closeHelpModal());
        this.dom.helpModal.addEventListener('click', (e) => {
            if (e.target === this.dom.helpModal) this.closeHelpModal();
        });

        // Solution copy button
        this.dom.solutionCopyBtn.addEventListener('click', () => this.copySolutionToClipboard());

        // Error retry
        this.dom.errorRetryBtn.addEventListener('click', () => this.init());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Accessibility: focus management
        this.dom.answerInput.addEventListener('focus', () => {
            this.dom.answerInput.setAttribute('aria-expanded', 'true');
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(e) {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.toggleSolution();
            }
        }
    }

    /**
     * Load case by index
     */
    loadCase(index) {
        const caseData = getCaseByIndex(index);
        
        if (!caseData) {
            this.handleError(new Error('Кейс не найден'));
            return;
        }

        this.state.currentCaseIndex = index;
        this.state.solutionShown = false;
        this.state.checkedItems.clear();

        // Render UI
        this.renderCaseHeader(caseData);
        this.renderMessages(caseData.messages);
        this.renderChecklist(caseData.checklist);
        this.resetWorkspace();

        // Update progress
        this.updateProgress();

        // Emit event
        this.events.emit('case-loaded', { index, caseData });
    }

    /**
     * Render case header
     */
    renderCaseHeader(caseData) {
        this.dom.chatProject.textContent = caseData.project;
        this.dom.chatContext.textContent = caseData.context;
        this.dom.workspaceTitle.textContent = caseData.title;
        this.dom.workspaceSubtitle.textContent = caseData.task;
        this.dom.instructionText.textContent = caseData.instruction;
    }

    /**
     * Render chat messages with grouping
     */
    renderMessages(messages) {
        this.dom.messagesContainer.innerHTML = '';

        let lastAuthor = null;
        let currentGroup = null;

        messages.forEach((msg, index) => {
            // Create new group if author changed
            if (msg.author !== lastAuthor) {
                currentGroup = document.createElement('div');
                currentGroup.className = `message-group group-${msg.side}`;
                this.dom.messagesContainer.appendChild(currentGroup);

                const header = document.createElement('div');
                header.className = 'message-group-header';
                header.textContent = msg.author;
                currentGroup.appendChild(header);

                lastAuthor = msg.author;
            }

            // Create message element
            const messageEl = this.createMessageElement(msg);
            messageEl.style.animationDelay = `${index * CONFIG.ui.messageGroupDelay}ms`;
            currentGroup.appendChild(messageEl);
        });

        // Auto-scroll to bottom
        setTimeout(() => {
            this.dom.messagesContainer.scrollTop = this.dom.messagesContainer.scrollHeight;
        }, CONFIG.ui.autoscrollDelay);
    }

    /**
     * Create message element
     */
    createMessageElement(message) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.side}`;
        messageEl.setAttribute('role', 'article');

        const author = document.createElement('span');
        author.className = 'message-author';
        author.textContent = message.author;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = message.text;
        bubble.setAttribute('aria-label', `Сообщение от ${message.author}: ${message.text}`);

        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = message.time;
        time.setAttribute('aria-label', `Время: ${message.time}`);

        messageEl.appendChild(author);
        messageEl.appendChild(bubble);
        messageEl.appendChild(time);

        return messageEl;
    }

    /**
     * Render checklist
     */
    renderChecklist(checklistItems) {
        this.dom.checklistContainer.innerHTML = '';

        checklistItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'checklist-card';
            card.setAttribute('role', 'checkbox');
            card.setAttribute('aria-checked', 'false');
            card.setAttribute('tabindex', '0');
            card.dataset.itemId = item.id;

            card.innerHTML = `
                <div class="checklist-card-icon">${item.icon}</div>
                <div class="checklist-card-title">${item.title}</div>
                <div class="checklist-card-description">${item.description}</div>
                <div class="checklist-card-checkbox">
                    <div class="checkbox-icon"></div>
                    <span>Учел(а)</span>
                </div>
            `;

            card.addEventListener('click', () => this.toggleChecklistCard(item.id, card));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleChecklistCard(item.id, card);
                }
            });

            this.dom.checklistContainer.appendChild(card);
        });

        this.updateChecklistProgress();
    }

    /**
     * Toggle checklist card
     */
    toggleChecklistCard(itemId, cardElement) {
        if (this.state.checkedItems.has(itemId)) {
            this.state.checkedItems.delete(itemId);
            cardElement.classList.remove('checked');
            cardElement.setAttribute('aria-checked', 'false');
        } else {
            this.state.checkedItems.add(itemId);
            cardElement.classList.add('checked');
            cardElement.setAttribute('aria-checked', 'true');
        }

        this.updateChecklistProgress();
        this.events.emit('checklist-toggled', { itemId });
    }

    /**
     * Update checklist progress
     */
    updateChecklistProgress() {
        const currentCase = this.cases[this.state.currentCaseIndex];
        const total = currentCase.checklist.length;
        const checked = this.state.checkedItems.size;
        this.dom.checklistProgress.textContent = `${checked}/${total}`;
    }

    /**
     * Handle answer input
     */
    onAnswerInput(e) {
        const value = e.target.value;
        const length = value.length;
        const max = parseInt(this.dom.answerInput.getAttribute('maxlength'));

        // Update char count
        this.dom.charCurrent.textContent = length;

        // Warning when approaching limit
        if (length >= max * CONFIG.validation.warningThreshold) {
            this.dom.charCount.classList.add('warning');
        } else {
            this.dom.charCount?.classList.remove('warning');
        }

        // Show hint
        if (length < CONFIG.validation.minAnswerLength) {
            this.dom.inputHint.textContent = `Минимум ${CONFIG.validation.minAnswerLength} символов`;
            this.dom.inputHint.classList.remove('active');
        } else if (length > CONFIG.validation.maxAnswerLength) {
            this.dom.inputHint.textContent = 'Превышена максимальная длина';
            this.dom.inputHint.classList.remove('active');
        } else {
            this.dom.inputHint.textContent = `${length} символов — отлично!`;
            this.dom.inputHint.classList.add('active');
        }

        this.events.emit('answer-changed', { length });
    }

    /**
     * Toggle solution visibility
     */
    toggleSolution() {
        if (this.state.solutionShown) {
            this.hideSolution();
        } else {
            this.showSolution();
        }
    }

    /**
     * Show solution
     */
    showSolution() {
        const caseData = this.cases[this.state.currentCaseIndex];

        // Validate answer
        const answer = this.dom.answerInput.value.trim();
        if (answer.length < CONFIG.validation.minAnswerLength) {
            this.toast.info(CONFIG.messages.emptyAnswer);
            return;
        }

        // Show solution
        this.dom.solutionContent.textContent = caseData.solution;
        this.dom.solutionSection.style.display = 'flex';

        // Update button
        this.dom.showSolutionBtn.textContent = 'Скрыть решение';
        this.dom.showSolutionBtn.classList.add('solution-shown');

        this.state.solutionShown = true;

        // Show feedback
        this.showSolutionFeedback();

        // Scroll to solution
        setTimeout(() => {
            this.dom.solutionSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);

        this.events.emit('solution-shown', {});
    }

    /**
     * Hide solution
     */
    hideSolution() {
        this.dom.solutionSection.style.display = 'none';
        this.dom.showSolutionBtn.textContent = 'Показать решение';
        this.dom.showSolutionBtn.classList.remove('solution-shown');

        this.state.solutionShown = false;

        this.events.emit('solution-hidden', {});
    }

    /**
     * Show solution feedback
     */
    showSolutionFeedback() {
        const checked = this.state.checkedItems.size;
        const total = this.cases[this.state.currentCaseIndex].checklist.length;

        if (checked === total) {
            this.dom.solutionFeedback.textContent = '✓ Отлично! Вы учли все критерии';
            this.dom.solutionFeedback.classList.add('show');
        } else {
            this.dom.solutionFeedback.classList.remove('show');
        }
    }

    /**
     * Copy solution to clipboard
     */
    async copySolutionToClipboard() {
        const text = this.dom.solutionContent.textContent;
        
        try {
            await navigator.clipboard.writeText(text);
            this.toast.success(CONFIG.messages.copying);

            // Visual feedback
            this.dom.solutionCopyBtn.classList.add('copied');
            setTimeout(() => {
                this.dom.solutionCopyBtn.classList.remove('copied');
            }, 2000);

            this.events.emit('solution-copied', {});
        } catch (err) {
            this.toast.error('Не удалось скопировать');
            console.error('Clipboard copy failed:', err);
        }
    }

    /**
     * Move to next case
     */
    nextCase() {
        if (this.state.currentCaseIndex < this.cases.length - 1) {
            this.loadCase(this.state.currentCaseIndex + 1);
            this.events.emit('case-next', {});
        } else {
            this.toast.info('Вы прошли все кейсы!');
            this.dom.nextCaseBtn.disabled = true;
        }
    }

    /**
     * Move to previous case
     */
    previousCase() {
        if (this.state.currentCaseIndex > 0) {
            this.loadCase(this.state.currentCaseIndex - 1);
            this.events.emit('case-previous', {});
        }
    }

    /**
     * Update total cases display
     */
    updateTotalCases() {
        this.dom.totalCasesSpan.textContent = this.getTotalCases();
    }

    /**
     * Update progress bar
     */
    updateProgress() {
        const current = this.state.currentCaseIndex + 1;
        const total = this.getTotalCases();
        const percentage = (current / total) * 100;
        
        this.dom.currentCaseSpan.textContent = current;
        this.dom.progressFill.style.width = `${percentage}%`;

        // Update button states
        this.dom.prevCaseBtn.disabled = current === 1;
        this.dom.nextCaseBtn.disabled = current === total;
    }

    /**
     * Reset workspace for new case
     */
    resetWorkspace() {
        this.dom.answerInput.value = '';
        this.dom.charCurrent.textContent = '0';
        this.dom.inputHint.textContent = '';
        this.dom.inputHint.classList.remove('active');
        this.dom.solutionSection.style.display = 'none';
        this.dom.showSolutionBtn.textContent = 'Показать решение';
        this.dom.showSolutionBtn.classList.remove('solution-shown');
        this.dom.answerInput.focus();
    }

    /**
     * Open help modal
     */
    openHelpModal() {
        this.dom.helpModal.showModal();
    }

    /**
     * Close help modal
     */
    closeHelpModal() {
        this.dom.helpModal.close();
    }

    /**
     * Update app state
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
    }

    /**
     * Show layout
     */
    showLayout() {
        this.dom.loadingState.style.display = 'none';
        this.dom.errorState.style.display = 'none';
        this.dom.layout.style.display = 'flex';
    }

    /**
     * Show error state
     */
    showErrorState(message) {
        this.dom.loadingState.style.display = 'none';
        this.dom.layout.style.display = 'none';
        this.dom.errorState.style.display = 'flex';
        this.dom.errorMessage.textContent = message;
    }

    /**
     * Handle errors
     */
    handleError(error) {
        console.error('❌ Error:', error);
        this.setState({ 
            appState: 'error',
            error: error.message 
        });
        this.showErrorState(error.message);
    }

    /**
     * Get current case
     */
    getCurrentCase() {
        return this.cases[this.state.currentCaseIndex];
    }

    /**
     * Get total cases
     */
    getTotalCases() {
        return this.cases.length;
    }
}

// ============================================
// APPLICATION INITIALIZATION
// ============================================

let trainer;

document.addEventListener('DOMContentLoaded', () => {
    try {
        trainer = new CommunicationTrainer();
        window.trainer = trainer; // For debugging in console
    } catch (error) {
        console.error('Fatal error:', error);
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
});