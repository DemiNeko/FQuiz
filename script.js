let questions = [];
let current = 0;
let score = 0;
let answered = [];

const params = new URLSearchParams(window.location.search);
const subject = params.get("subject") || "db";

fetch(`data/${subject}.json`)
  .then(res => res.json())
  .then(data => {
    questions = shuffleArray(data);
    questions = questions.map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }));
    answered = new Array(questions.length);
    showQuestion();

    document.getElementById("prevBtn").onclick = () => {
      if (current > 0) { current--; showQuestion(); }
    };
  });

function shuffleArray(array) {
  return array
    .map(a => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map(a => a.value);
}

function showQuestion() {
  const q = questions[current];
  document.getElementById("question").textContent = q.question;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = opt.text;
    btn.onclick = () => checkAnswer(i);
    if (answered[current] !== undefined) {
      btn.disabled = true;
      if (opt.isCorrect) btn.classList.add("correct");
      else if (i === answered[current]) btn.classList.add("incorrect");
    }
    optionsDiv.appendChild(btn);
  });

  // Счёт — показываем только если уже есть хоть один ответ
  const scoreEl = document.getElementById("score");
  if (scoreEl) {
    scoreEl.style.display = answered.some(a => a !== undefined) ? "block" : "none";
    scoreEl.textContent = `Баллы: ${score}`;
  }

  // Прогресс
  const progressEl = document.getElementById("progress");
  if (progressEl) progressEl.textContent = `${current + 1} из ${questions.length}`;

  // Кнопка Далее / Завершить
  const nextBtn = document.getElementById("nextBtn");
  if (current === questions.length - 1) {
    nextBtn.textContent = "Завершить";
    nextBtn.onclick = finishQuiz;
  } else {
    nextBtn.textContent = "Далее";
    nextBtn.onclick = () => { current++; showQuestion(); };
  }
}

function checkAnswer(index) {
  if (answered[current] !== undefined) return;

  answered[current] = index;

  const q = questions[current];
  const correctIndex = q.options.findIndex(opt => opt.isCorrect);

  document.querySelectorAll("#options button").forEach((b, i) => {
    b.disabled = true;
    if (q.options[i].isCorrect) b.classList.add("correct");
    if (i === index && !q.options[i].isCorrect) b.classList.add("incorrect");
  });

  if (index === correctIndex) score++;

  const scoreEl = document.getElementById("score");
  if (scoreEl) {
    scoreEl.style.display = "block";
    scoreEl.textContent = `Баллы: ${score}`;
  }
}

function finishQuiz() {
  const total = questions.length;
  const pct   = total > 0 ? Math.round((score / total) * 100) : 0;

  // Цвет бара по результату
  const barColor = pct >= 70
    ? 'linear-gradient(90deg,#34d399,#10b981)'
    : pct >= 40
      ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
      : 'linear-gradient(90deg,#f87171,#ef4444)';

  // Скрываем кнопку "Қатемен жұмыс" если ошибок нет
  const mistakesCount = questions.filter((q, i) => {
    const ci = q.options.findIndex(o => o.isCorrect);
    return answered[i] !== undefined && answered[i] !== ci;
  }).length;

  const mistakesBtn = mistakesCount > 0
    ? `<button class="btn-outline" onclick="reviewMistakes()">Қатемен жұмыс · ${mistakesCount}</button>`
    : '';

  document.body.innerHTML = `
    <div class="cwsa">
      <div class="result-box">
        <p class="result-label">Результат</p>
        <div class="result-score">${score}<span> / ${total}</span></div>
        <div class="result-bar-wrap">
          <div class="result-bar" style="width:${pct}%; background:${barColor}"></div>
        </div>
        <p class="result-pct">${pct}%</p>
        <div class="result-actions">
          <button class="btn-primary" onclick="restartQuiz()">Повторить</button>
          ${mistakesBtn}
          <button class="btn-ghost" onclick="goHome()">На главную</button>
        </div>
      </div>
    </div>
  `;
}

function restartQuiz() { location.reload(); }
function goHome() { window.location.href = "index.html"; }

function reviewMistakes() {
  const mistakes = questions
    .map((q, i) => ({ ...q, userAnswer: answered[i] }))
    .filter(q => {
      const ci = q.options.findIndex(o => o.isCorrect);
      return q.userAnswer !== undefined && q.userAnswer !== ci;
    });

  if (mistakes.length === 0) {
    alert("Ошибок не было!");
    return;
  }

  // Убираем лишнее поле перед записью в questions
  questions = mistakes.map(({ userAnswer, ...q }) => q);
  answered  = new Array(questions.length);
  current   = 0;
  score     = 0;

  // Восстанавливаем структуру страницы теста
  document.body.innerHTML = `
    <div class="text">NQUIZ</div>
    <div class="container">
      <div id="question-box">
        <h2 id="question"></h2>
        <div id="options"></div>
        <div class="nav">
          <button id="prevBtn">← Назад</button>
          <div id="progress"></div>
          <button id="nextBtn">Далее</button>
        </div>
        <div id="score" style="display:none">Баллы: 0</div>
      </div>
    </div>
    <a href="index.html" class="home-btn">Home</a>
  `;

  document.getElementById("prevBtn").onclick = () => {
    if (current > 0) { current--; showQuestion(); }
  };

  showQuestion();
}
