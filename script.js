// ========== Основна функція оброки файлу ==========
function processFile(){
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  if(!file){
    alert('Будь ласка, виберіть файл!')
    return;
  }
  
  const reader = new FileReader();

  reader.onload = function(e){
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
  }

  reader.readAsText(file);
}

function clearOutput(){
  document.getElementById('output').textContent = 'Очікування файлу...';
  document.getElementById('fileInput').value = '';
}

// ========== Конвертер з .gtr в .xml ==========
function gtrToXml(data) {
  const lines = data.split('\n').filter(line => line.trim() !== '');
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<genealogy>\n';

  // Стек для відсліження батьків
  let stack = [];
  let indent = 1;
  let currentPerson = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const parts = line.split(/\s+/);

    if (parts.length < 3) continue;

    const level = parseInt(parts[0]);
    const tag = parts[1];
    const value = parts.slice(2).join(' ');

    // Якщо рівень менший або рівний, закриваємо передніх батьків
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      const closed = stack.pop();
      if (closed.tag === 'person') {
        xml += '  '.repeat(closed.level) + '</person>\n';
      } else if (closed.tag === 'children') {
        xml += '  '.repeat(closed.level) + '</children>\n';
      }
    }

    // Визначаємо поточний рівень вкладенності
    const currentIndent = stack.length +1;

    if (tag === 'NAME') {
      // Нова людина
      const personIndent = currentIndent;
      const name = value;

      let attrs = { name: name };

      // Дивимося наступні рядки для зброу інформації про людину
      let j = i + 1;
      let childrenLevel = null;
      let personLines = [];

      // Збираємо всі рядки, що належать до цієї людини
      while (j < lines.length) {
        const nextParts = lines[j].trim().split(/\s+/);
        if (nextParts.length < 3) { j++; continue; }
        const nextLevel = parseInt(nextParts[0]);

        if (nextLevel <= level) break;

        const nextTag = nextParts[1];
        const nextValue = nextParts.slice(2).join(' ');

        // Якщо не нащадок
        if (nextLevel > level + 1) {
          break;
        }

        // Додаємо атрибут, якщо це не NAME
        if (nextTag === 'SURNAME') attrs.surname = nextValue;
        else if (nextTag === 'SEX') attrs.sex = nextValue;
        else if (nextTag === 'BIRTH') attrs.birth = nextValue;
        else if (nextTag === 'NAME') {
          break;
        }

        j++;
      }

      // Формуємо XML для людини
      let attrString = '';
      for (let key in attrs) {
        attrString += ` ${key}="${escapeXml(attrs[key])}"`;
      }

      xml += '  '.repeat(personIndent - 1) + `<person${attrString}>\n`;

      // Перевірка на нащадків
      let hasChildren = false;
      let k = i + 1;
      while (k < lines.length) {
        const nextParts = lines[k].trim().split(/\s+/);
        if (nextParts.length < 3) { k++; continue; }
        const nextLevel = parseInt(nextParts[0]);

        if (nextLevel <= level) break;

        if (nextLevel === level + 1) {
          hasChildren = true;
          break;
        }
        k++;
      }

      if (hasChildren) {
        xml += '  '.repeat(personIndent) + '<children>\n';
        stack.push({ level: level, tag: 'children', indent: personIndent });
      }

      stack.push({ level: level, tag: 'person', indent: personIndent - 1 });

      i = j - 1; // Переміщаємо індекс до останнього обробленого рядка
    }
  }

  // Закриваємо всі відкриті теги
  while (stack.length > 0) {
    const closed = stack.pop();
    if (closed.tag === 'person') {
      xml += '  '.repeat(closed.indent) + '</person>\n';
    } else if (closed.tag === 'children') {
      xml += '  '.repeat(closed.indent) + '</children>\n';
    }
  }

  xml += '</genealogy>';
  return xml;
}

function xmlToGtr(data) {

}



// Екранує спеціальні символи для XML
function escapeXml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Розекранує XML символи
function unescapeXml(str) {
    if (!str) return '';
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
}