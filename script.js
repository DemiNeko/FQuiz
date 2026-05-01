let questions = [];
let current = 0;
let score = 0;
let answered = [];
let isReviewingMistakes = false;

const params = new URLSearchParams(window.location.search);
const subject = params.get("subject") || "db";

fetch(`data/${subject}.json`)
  .then(res => res.json())
  .then(data => {
    // Рандомизация очерёдности вопросов
    questions = shuffleArray(data);

    // Рандомизация вариантов для каждого вопроса
    questions = questions.map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }));

    answered = new Array(questions.length);
    showQuestion();

    document.getElementById("prevBtn").onclick = () => {
      if (current > 0) {
        current--;
        showQuestion();
      }
    };
  })
  .catch(err => {
    console.error('Ошибка загрузки данных:', err);
    document.getElementById("question").textContent =
      `Ошибка загрузки: data/${subject}.json не найден.`;
  });

// Функция для рандомизации массива
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
    btn.onclick = () => checkAnswer(i, btn);
    if (answered[current] !== undefined) {
      btn.disabled = true;
      if (opt.isCorrect) btn.classList.add("correct");
      else if (i === answered[current]) btn.classList.add("incorrect");
    }
    optionsDiv.appendChild(btn);
  });

  // Показываем счёт только если уже отвечали
  const scoreEl = document.getElementById("score");
  if (scoreEl) {
    scoreEl.style.display = answered.some(a => a !== undefined) ? "block" : "none";
    scoreEl.textContent = `Баллы: ${score}`;
  }

  const nextBtn = document.getElementById("nextBtn");
  if (current === questions.length - 1) {
    nextBtn.textContent = "Завершить";
    nextBtn.onclick = finishQuiz;
  } else {
    nextBtn.textContent = "Далее →";
    nextBtn.onclick = () => {
      current++;
      showQuestion();
    };
  }

  // Прогресс
  const progressEl = document.getElementById("progress");
  if (progressEl) {
    progressEl.textContent = `${current + 1} из ${questions.length}`;
  }
}

function checkAnswer(index, btn) {
  if (answered[current] !== undefined) return;

  answered[current] = index;

  const q = questions[current];
  const correctIndex = q.options.findIndex(opt => opt.isCorrect);

  const buttons = document.querySelectorAll("#options button");
  buttons.forEach((b, i) => {
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
  const percent = Math.round((score / total) * 100);
  let emoji = percent >= 80 ? "🎉" : percent >= 50 ? "👍" : "📚";

  document.body.innerHTML = `
    <div class="cwsa">
      <div class="result-box">
        <div class="result-emoji">${emoji}</div>
        <h2>Результат: ${score} / ${total}</h2>
        <div class="result-bar-wrap">
          <div class="result-bar" style="width:${percent}%"></div>
        </div>
        <p class="result-percent">${percent}%</p>
        <button onclick="restartQuiz()">🔄 Повторить</button>
        <button onclick="goHome()">🏠 Домой</button>
        <button onclick="reviewMistakes()">❌ Работа над ошибками</button>
      </div>
    </div>
  `;
}

function restartQuiz() {
  location.reload();
}

function goHome() {
  window.location.href = "index.html";
}

function reviewMistakes() {
  const mistakes = questions
    .map((q, i) => ({ ...q, userAnswer: answered[i] }))
    .filter(q => {
      const correctIndex = q.options.findIndex(opt => opt.isCorrect);
      return q.userAnswer !== undefined && q.userAnswer !== correctIndex;
    });

  if (mistakes.length === 0) {
    alert("Ошибок не было! Отличный результат 🎉");
    return;
  }

  questions = mistakes;
  answered = new Array(questions.length);
  current = 0;
  score = 0;
  isReviewingMistakes = true;

  document.body.innerHTML = `
    <div class="text">Ошибки</div>
    <div class="container">
      <div id="question-box">
        <h2 id="question"></h2>
        <div id="options"></div>
        <div class="nav">
          <button id="prevBtn">← Назад</button>
          <div id="progress"></div>
          <button id="nextBtn">Далее →</button>
        </div>
        <div id="score" style="display:none">Баллы: 0</div>
      </div>
    </div>
    <a href="index.html" class="home-btn">Home</a>
  `;

  document.getElementById("prevBtn").onclick = () => {
    if (current > 0) {
      current--;
      showQuestion();
    }
  };

  showQuestion();
}
