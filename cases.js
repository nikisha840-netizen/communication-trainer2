// ============================================
// TRAINING CASES DATA
// ============================================

const CASES = [
    {
        id: 1,
        title: 'Вопрос о конверсиях в отчете',
        project: 'Автозапчасти — маркетинг',
        context: 'Клиент спрашивает в чате про конверсии. Специалист отказывает.',
        messages: [
            {
                author: 'Анна Морозова',
                role: 'client',
                side: 'other',
                time: '10:23',
                text: 'Привет! Смотрю отчет по кампании за прошлую неделю. Почему не подтягиваются конверсии в Яндекс.Метрике? Мне нужны цифры для презентации клиенту завтра.',
            },
            {
                author: 'Ты',
                role: 'specialist',
                side: 'own',
                time: '10:45',
                text: 'Это вообще не моя зона ответственности. Пусть аналитики ответят.',
            },
        ],
        task: 'Переформулируйте ответ специалиста так, чтобы он показал ответственность, помощь и управление ожиданиями.',
        instruction: 'Ваша задача — переписать плохой ответ. Не просто отказ, а конструктивное решение с указанием времени.',
        checklist: [
            {
                id: 'what',
                icon: '🎯',
                title: 'Что происходит?',
                description: 'Покажите, что вы поняли ситуацию и видите проблему клиента',
            },
            {
                id: 'how',
                icon: '⚙️',
                title: 'Что будете делать?',
                description: 'Назовите конкретные действия: подключу, обсудим, соберу команду',
            },
            {
                id: 'when',
                icon: '⏰',
                title: 'Когда ответ?',
                description: 'Установите точное время ответа (сегодня до 12:00, завтра к 9:00)',
            },
            {
                id: 'trust',
                icon: '🤝',
                title: 'Управление ожиданиями',
                description: 'Клиент должен быть уверен, что получит решение',
            },
        ],
        solution: 'Анна, спасибо за вопрос! Я вижу, что тебе срочно нужны цифры для презентации завтра.\n\nДействительно, толкование метрики требует участия аналитика. Я сейчас подключу коллегу из нашей аналитической команды в переписку. Мы вместе разберемся, почему конверсии не синхронизируются, и дадим тебе точный ответ.\n\nПредварительный комментарий от нас — не позже 14:00 сегодня. Хватит времени на внесение изменений в презентацию?',
    },
    {
        id: 2,
        title: 'Запрос на срочное согласование',
        project: 'E-commerce маркетинг',
        context: 'Коллега просит срочно согласовать креатив. Специалист отказывает из-за загруженности.',
        messages: [
            {
                author: 'Виктор Петров',
                role: 'colleague',
                side: 'other',
                time: '14:32',
                text: 'Привет! Нужно срочно согласовать новый креатив для рекламной кампании. Клиент ждет. Можешь посмотреть хотя бы сегодня?',
            },
            {
                author: 'Ты',
                role: 'specialist',
                side: 'own',
                time: '14:55',
                text: 'Не могу. Очень много работы. Может быть завтра.',
            },
        ],
        task: 'Переформулируйте ответ так, чтобы согласовать сроки и показать готовность помочь.',
        instruction: 'Найдите компромисс между вашей загруженностью и потребностями коллеги. Предложите конкретное время.',
        checklist: [
            {
                id: 'urgent',
                icon: '⚡',
                title: 'Признаете приоритет',
                description: 'Покажите, что вы понимаете срочность и важность для клиента',
            },
            {
                id: 'solution',
                icon: '💡',
                title: 'Предлагаете решение',
                description: 'Не просто "не могу", а "смогу в... или через... минут"',
            },
            {
                id: 'time',
                icon: '🕐',
                title: 'Договариваетесь о времени',
                description: 'Назовите конкретное время (15 минут, через час, до конца дня)',
            },
            {
                id: 'commitment',
                icon: '✅',
                title: 'Показываете обязательства',
                description: 'Клиент остается в ожидании, а не в неопределенности',
            },
        ],
        solution: 'Виктор, я понимаю, что это срочно и клиент в ожидании. Это важно.\n\nДай мне 15 минут — я перестроюсь и посмотрю креатив. Первичную оценку дам к 15:15, детальный фидбек — к 16:30. Этого хватит, чтобы вы могли выслать клиенту ответ?',
    },
    {
        id: 3,
        title: 'Жалоба на качество работы',
        project: 'Реклама в соцсетях',
        context: 'Клиент недоволен результатами и обвиняет вашу команду. Нужен сочувствующий ответ.',
        messages: [
            {
                author: 'Максим Сухов',
                role: 'client',
                side: 'other',
                time: '09:15',
                text: 'Это уже второй месяц результаты падают. Что вы вообще делаете? За эти деньги я жду большего. Может быть, поменять агентство?',
            },
            {
                author: 'Ты',
                role: 'specialist',
                side: 'own',
                time: '09:42',
                text: 'Максим, рынок сейчас сложный, все агентства сталкиваются с этим. Это не наша вина.',
            },
        ],
        task: 'Напишите ответ, который примет ответственность, объяснит ситуацию и предложит план действий.',
        instruction: 'Помните: сначала сочувствие, потом объяснение, потом действие.',
        checklist: [
            {
                id: 'empathy',
                icon: '💙',
                title: 'Сочувствие к клиенту',
                description: 'Признайте его разочарование, не оправдывайте сразу',
            },
            {
                id: 'ownership',
                icon: '👤',
                title: 'Возьмите ответственность',
                description: 'Не перекладывайте вину на рынок, скажите что вы сделаете',
            },
            {
                id: 'analysis',
                icon: '📊',
                title: 'Дайте объяснение',
                description: 'Почему происходит падение (реальные причины, не отговорки)',
            },
            {
                id: 'plan',
                icon: '🛠️',
                title: 'Предложите план',
                description: 'Конкретные шаги: аудит, встреча, эксперименты, новая стратегия',
            },
        ],
        solution: 'Максим, я понимаю твое разочарование. Ты вкладываешь средства и ожидаешь результаты — это справедливо.\n\nДавай разберемся вместе. Я провел предварительный анализ и вижу, где произошли сбои. Предлагаю в среду провести звонок, где я расскажу:\n• Что случилось с метриками (анализ данных)\n• Какие факторы на это повлияли\n• Какой план действий мы запустим с понедельника\n\nВозможно, нам нужна корректировка стратегии. Но я уверен, что вместе мы найдем решение. Согласен на встречу?',
    },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get case by ID
 * @param {number} id - Case ID
 * @returns {Object|null}
 */
function getCaseById(id) {
    return CASES.find(c => c.id === id) || null;
}

/**
 * Get case by index
 * @param {number} index - Case index
 * @returns {Object|null}
 */
function getCaseByIndex(index) {
    if (index < 0 || index >= CASES.length) return null;
    return CASES[index];
}

/**
 * Get total cases
 * @returns {number}
 */
function getTotalCases() {
    return CASES.length;
}

/**
 * Validate case structure
 * @param {Object} caseObj - Case object to validate
 * @returns {boolean}
 */
function isValidCase(caseObj) {
    const required = ['id', 'title', 'project', 'messages', 'task', 'checklist', 'solution'];
    return required.every(key => key in caseObj) && 
           Array.isArray(caseObj.messages) && 
           Array.isArray(caseObj.checklist);
}

/**
 * Add new case
 * @param {Object} caseObj - Case object
 * @returns {boolean}
 */
function addCase(caseObj) {
    if (!isValidCase(caseObj)) {
        console.error('Invalid case structure');
        return false;
    }
    CASES.push(caseObj);
    return true;
}

/**
 * Remove case by ID
 * @param {number} id - Case ID
 * @returns {boolean}
 */
function removeCase(id) {
    const index = CASES.findIndex(c => c.id === id);
    if (index > -1) {
        CASES.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * Update case by ID
 * @param {number} id - Case ID
 * @param {Object} updates - Updates object
 * @returns {boolean}
 */
function updateCase(id, updates) {
    const caseObj = getCaseById(id);
    if (!caseObj) return false;
    Object.assign(caseObj, updates);
    return true;
}