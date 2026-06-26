// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    // UI
    ui: {
        animationDuration: {
            fast: 100,
            base: 200,
            slow: 300,
        },
        messageGroupDelay: 50,
        autoscrollDelay: 0,
    },

    // VALIDATION
    validation: {
        minAnswerLength: 10,
        maxAnswerLength: 500,
        warningThreshold: 0.9, // 90% of max
    },

    // FEATURE FLAGS
    features: {
        showCharCount: true,
        showChecklistProgress: true,
        enableCopyButton: true,
        enableNavigation: true,
    },

    // MESSAGES
    messages: {
        copying: 'Скопировано!',
        error: 'Что-то пошло не так',
        loading: 'Загрузка...',
        emptyAnswer: 'Напишите ответ перед проверкой',
    },

    // TOAST
    toast: {
        duration: 3000,
        position: 'bottom-right',
    },
};

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}