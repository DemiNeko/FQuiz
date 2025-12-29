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
    // Рандомизация очередности вопросов
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

  document.getElementById("score").textContent = `Баллы: ${score}`;

  const nextBtn = document.getElementById("nextBtn");
  if (current === questions.length - 1) {
    nextBtn.textContent = "Завершить";
    nextBtn.onclick = finishQuiz;
  } else {
    nextBtn.textContent = "Далее";
    nextBtn.onclick = () => {
      current++;
      showQuestion();
    };
  }

  // Показать номер текущего вопроса под вопросом
  document.getElementById("progress").textContent = ` ${current + 1} из ${questions.length}`;

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
  document.getElementById("score").textContent = `Баллы: ${score}`;
}

function finishQuiz() {
  document.body.innerHTML = `
    <div class="cwsa">
      <div class="result-box">
        <h2>Ваш результат: ${score} / ${questions.length}</h2>
        <button onclick="restartQuiz()">Повторить</button>
        <button onclick="goHome()">Домой</button>
        <button onclick="reviewMistakes()">Қатемен жұмыс</button>
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
    alert("Ошибок не было!");
    return;
  }

  questions = mistakes;
  answered = new Array(questions.length);
  current = 0;
  score = 0;
  isReviewingMistakes = true;

  document.body.innerHTML = `
    <div class="container">
      <div id="question-box">
        <h2 id="question"></h2>
        <div id="options"></div>
        <div class="nav">
          <button id="prevBtn">← Назад</button>
          <button id="nextBtn">Далее →</button>
        </div>
        <div id="score">Баллы: 0</div>
        <div id="currentQuestionNum"></div>  <!-- Добавим отображение текущего вопроса -->
      </div>
    </div>
  `;

  document.getElementById("prevBtn").onclick = () => {
    if (current > 0) {
      current--;
      showQuestion();
    }
  };

  showQuestion();
}
