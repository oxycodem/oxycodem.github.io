document.addEventListener('DOMContentLoaded', () => {
    const spis = document.getElementById('lesson-spis');
    const content = document.getElementById('lesson-content');
    const backButton = document.getElementById('back-button');
    const lessonsNav = document.getElementById('lessons-nav');

    content.innerHTML = '';
    backButton.style.display = 'none';
    backButton.removeEventListener('click', () => {
        if (currentView === 'lesson') {
            loadLessonsForTheme(activeThemeDir, activeThemeTitle);
            content.classList.remove('active');
        } else if (currentView === 'lessons') {
            loadThemes();
        }
    });
    backButton.addEventListener('click', () => {
        if (currentView === 'lesson') {
            loadLessonsForTheme(activeThemeDir, activeThemeTitle);
            content.classList.remove('active');
        } else if (currentView === 'lessons') {
            loadThemes();
        }
    });

    let currentView = 'themes';
    let activeThemeDir = '';
    let activeThemeTitle = '';
    async function loadThemes() {
        spis.innerHTML = '';
        lessonsNav.querySelector('h2') ? lessonsNav.querySelector('h2').remove() : null;
        const themeTitle = document.createElement('h2');
        themeTitle.textContent = 'YandexLMS 2 year crack';
        lessonsNav.prepend(themeTitle);

        const themeDirs = [
            'Повторение',
            'Файлы_и_исключения',
            'PyQT',
            'GIT',
            'Arcade',
            'Командная_строка',
            'API',
            'WEB',
            'Факультативы',
            'Задачи'
        ];

        for (const themeDir of themeDirs) {
            try {
                const response = await fetch(`themes/${themeDir}/theme.json`);
                if (!response.ok) {
                    throw new Error(`Ошибка при загрузке темы ${themeDir}: ${response.status}`);
                }
                const themeData = await response.json();

                const listItem = document.createElement('li');
                const link = document.createElement('a');
                link.href = `#${themeDir}`;
                link.dataset.theme = themeDir;
                link.innerHTML = `
                    <h3>${themeData.title}</h3>
                    <p>${themeData.description.substring(0, 50)}...</p>
                `;
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    activeThemeDir = themeDir;
                    activeThemeTitle = themeData.title;
                    loadLessonsForTheme(activeThemeDir, activeThemeTitle);
                });
                listItem.appendChild(link);
                spis.appendChild(listItem);
            } catch (error) {
                console.error(`Ошибка при загрузке темы ${themeDir}:`, error);
            }
        }
        currentView = 'themes';
        backButton.style.display = 'none';
    }

    async function loadLessonsForTheme(themeDir, themeTitleText) {
        spis.innerHTML = '';
        lessonsNav.querySelector('h2') ? lessonsNav.querySelector('h2').remove() : null;
        const lessonTitle = document.createElement('h2');
        lessonTitle.textContent = themeTitleText;
        lessonsNav.prepend(lessonTitle);

        const lessonPaths = [];
        if (themeDir === 'Повторение') {
            lessonPaths.push(
                'themes/Повторение/lessons/Повторение_Проектирование_классов.json',
                'themes/Повторение/lessons/Повторение_Решение_задач_на_классы.json',
                'themes/Повторение/lessons/Повторение_Решение_задач_на_основные_конструкции_данных.json'
            );
        } else if (themeDir === 'PyQT') {
            lessonPaths.push(
                'themes/PyQT/lessons/QT_1_what_QT.json'
            );
        } else if (themeDir === 'Файлы_и_исключения') {
            lessonPaths.push(
                'themes/Файлы_и_исключения/lessons/Исключения.json',
                'themes/Файлы_и_исключения/lessons/Текстовые_файлы_txt_и_csv.json'
            );
        }

        if (lessonPaths.length > 0) {
            for (const path of lessonPaths) {
                try {
                    const response = await fetch(path);
                    if (!response.ok) {
                        throw new Error(`Ошибка при загрузке урока ${path}: ${response.status}`);
                    }
                    const datesoflesson = await response.json();
                    const uuid = path.replace(/\//g, '-').replace(/\.json$/, '');

                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = `#${uuid}`;
                    link.dataset.uuid = uuid;
                    link.innerHTML = `
                        <h3>${datesoflesson.title}</h3>

                    `;
                    link.addEventListener('click', (event) => {
                        event.preventDefault();
                        displayLesson(datesoflesson);
                        content.classList.add('active');
                    });
                    listItem.appendChild(link);
                    spis.appendChild(listItem);
                } catch (error) {
                    console.error(`Ошибка при загрузке урока ${path}:`, error);
                }
            }
        } else {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<p>Уроки для этой темы пока недоступны.</p>`;
            spis.appendChild(listItem);
        }

        currentView = 'lessons';
        backButton.style.display = 'block';
    }

    async function displayLesson(datesoflesson) {
        content.innerHTML = '';
        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('lesson-content-wrapper');
        contentWrapper.innerHTML = `<h2>${datesoflesson.title}</h2>`; 

        const taskCategories = {
            'Классная работа': [],
            'Домашняя работа': [],
            'Дополнительные задачи': [],
            'Задания': []
        };

        for (const task of datesoflesson.tasks) {
            let codeContent = '';
            if (task.codePath) {
                try {
                    const response = await fetch(task.codePath);
                    codeContent = await response.text();
                } catch (error) {
                    console.error(`Ошибка при загрузке кода для ${task.title}:`, error);
                    codeContent = 'Не удалось загрузить код.';
                }
            } else if (task.code) {
                codeContent = task.code;
            }
            const taskWithContent = { ...task, code: codeContent, solution: '' };
            const lowerCaseTitle = task.title.toLowerCase();
            if (lowerCaseTitle.includes('классная работа')) {
                taskCategories['Классная работа'].push(taskWithContent);
            } else if (lowerCaseTitle.includes('домашняя работа')) {
                taskCategories['Домашняя работа'].push(taskWithContent);
            } else if (lowerCaseTitle.includes('дополнительные задачи')) {
                taskCategories['Дополнительные задачи'].push(taskWithContent);
            } else {
                taskCategories['Задания'].push(taskWithContent);
            }
        }

        for (const category in taskCategories) {
            if (taskCategories[category].length > 0) {
                const categorySection = document.createElement('div');
                categorySection.classList.add('task-category-section');
                categorySection.innerHTML = `<h3>${category}</h3>`;
                taskCategories[category].forEach((task, index) => {
                    const taskItem = document.createElement('div');
                    taskItem.classList.add('task-item');
                    taskItem.innerHTML = `
                        <h4>${task.title}</h4>
                        <p>${task.solver}</p>
                        <button class="code-toggle">Показать код</button>
                        <div class="code-content">
                            <pre>${task.code}</pre>
                        </div>
                    `;
                    categorySection.appendChild(taskItem);
                });
                contentWrapper.appendChild(categorySection);
            }
        }
        content.appendChild(contentWrapper);
        currentView = 'lesson';
        backButton.style.display = 'block';
        document.querySelectorAll('.code-toggle').forEach(button => {
            button.addEventListener('click', (event) => {
                const codeContent = event.target.nextElementSibling;
                codeContent.classList.toggle('active');
                if (codeContent.classList.contains('active')) {
                    event.target.textContent = 'Скрыть код';
                } else {
                    event.target.textContent = 'Показать код';
                }
            });
        });
    }
    loadThemes();
});
