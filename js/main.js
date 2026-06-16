import { gtrToXml } from "./gtrToxml.js";
import { xmlToGtr } from "./xmlToGtr.js";
import { clearOutput } from './clearOutput.js';

// ========== Основна функція оброки файлу ==========
window.processFile = function() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if (!file) {
    alert('Будь ласка, виберіть файл!');
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    const text = e.target.result;
    let result = '';

    // Визначаємо тип файлу за розширенням
    if (file.name.endsWith('.gtr')) {
      result = gtrToXml(text);
      document.getElementById('output').textContent = result;
    } else if (file.name.endsWith('.xml')) {
      result = xmlToGtr(text);
      document.getElementById('output').textContent = result;
    } else {
      alert('Непідтримуваний формат файлу. Будь ласка, виберіть .gtr або .xml файл.');
    }
  };

  reader.readAsText(file);
};
document.getElementById('fileInput').addEventListener('change', function() {
  const fileName = this.files[0] ? this.files[0].name : 'Файл не вибрано';
  document.getElementById('fileName').textContent = fileName;
});

// Робимо clearOutput глобальною
window.clearOutput = clearOutput;