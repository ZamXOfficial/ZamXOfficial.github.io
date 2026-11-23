const output = document.getElementById("scriptOutput");
const revealBtn = document.getElementById("revealBtn");
const copyBtn = document.getElementById("copyBtn");
const status = document.getElementById("status");
let publishedText = "";

// Загрузка публичного текста из script.txt.
revealBtn.addEventListener("click", async () => {
  revealBtn.disabled = true;
  revealBtn.textContent = "ЗАГРУЗКА...";
  status.textContent = "Загружаем публичную версию...";
  try {
    const response = await fetch("script.txt", { cache: "no-store" });
    if (!response.ok) throw new Error("Файл script.txt не найден.");
    publishedText = await response.text();
    if (!publishedText.trim() || publishedText.includes("PLACEHOLDER")) {
      throw new Error("Пока нет опубликованного текста. Загляни сюда позже.");
    }
    output.textContent = publishedText;
    copyBtn.disabled = false;
    status.textContent = "Публичная версия загружена. Её можно скопировать.";
    revealBtn.innerHTML = 'ОБНОВИТЬ ТЕКСТ <span>↻</span>';
  } catch (error) {
    output.textContent = error.message;
    status.textContent = "Не удалось загрузить публикацию. Попробуй обновить страницу.";
    copyBtn.disabled = true;
  } finally {
    revealBtn.disabled = false;
  }
});

// Копирование загруженного текста.
copyBtn.addEventListener("click", async () => {
  if (!publishedText) return;
  try {
    await navigator.clipboard.writeText(publishedText);
    status.textContent = "Скопировано в буфер обмена.";
  } catch {
    status.textContent = "Автокопирование недоступно. Выдели текст и скопируй вручную.";
  }
});
