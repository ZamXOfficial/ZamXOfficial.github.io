const output = document.getElementById("scriptOutput");
const revealBtn = document.getElementById("revealBtn");
const copyBtn = document.getElementById("copyBtn");
const status = document.getElementById("status");
let publishedText = "";

revealBtn.addEventListener("click", async () => {
  revealBtn.disabled = true;
  revealBtn.textContent = "ЗАГРУЗКА...";
  status.textContent = "Загружаем публичную версию...";
  try {
    const response = await fetch("script.txt", { cache: "no-store" });
    if (!response.ok) throw new Error("Файл script.txt не найден.");
    publishedText = await response.text();
    if (!publishedText.trim() || publishedText.includes("PLACEHOLDER")) {
      throw new Error("Владелец сайта ещё не добавил текст в script.txt.");
    }
    output.textContent = publishedText;
    copyBtn.disabled = false;
    status.textContent = "Публичная версия загружена. Теперь её можно скопировать.";
    revealBtn.innerHTML = 'ОБНОВИТЬ ТЕКСТ <span>↻</span>';
  } catch (error) {
    output.textContent = error.message;
    status.textContent = "Если ты владелец сайта, проверь содержимое script.txt и повторную публикацию.";
    copyBtn.disabled = true;
  } finally {
    revealBtn.disabled = false;
  }
});

copyBtn.addEventListener("click", async () => {
  if (!publishedText) return;
  try {
    await navigator.clipboard.writeText(publishedText);
    status.textContent = "Скопировано в буфер обмена.";
  } catch {
    status.textContent = "Автокопирование недоступно. Выдели текст в окне и скопируй вручную.";
  }
});
