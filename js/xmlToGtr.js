import { unescapeXml } from './helpers.js'

export function xmlToGtr(data) {
let result = [];
  let currentLevel = 0;
  
  // Видаляє перенесення рядків, щоб вони не розбивали логіку пошуку тексту
  let xmlStr = data.replace(/\r?\n|\r/g, '');
  
  let index = 0;
  
  // Головний цикл ручного обходу рядка
  while (index < xmlStr.length) {
    
    let startTag = xmlStr.indexOf('<', index);
    if (startTag === -1) break; // Якщо тегів більше немає, перериваємо цикл
  
    let endTag = xmlStr.indexOf('>', startTag);
    if (endTag === -1) break;
    
    let tagContent = xmlStr.substring(startTag + 1, endTag).trim();
    index = endTag + 1; // Зсуває вказівник для наступної ітерації
    
    if (tagContent.startsWith('?xml')) continue;

    if (tagContent.startsWith('/')) {
      let tagName = tagContent.substring(1).trim();
      
      // Якщо закривається person, виходить на рівень вище
      if (tagName === 'person') {
        currentLevel--;
      }
      continue; 
    }
  
    // Відокремлює ім'я тегу від його атрибутів по першому пробілу
    let spacePos = tagContent.indexOf(' ');
    let tagName = spacePos === -1 ? tagContent : tagContent.substring(0, spacePos);
    
    let isSelfClosing = tagContent.endsWith('/');
    if (isSelfClosing) {
      // Відрізає слеш з кінця рядка атрибутів
      tagContent = tagContent.substring(0, tagContent.length - 1).trim();
    }
    
    // Парсинг даних конкретної людини
    if (tagName === 'person') {
      currentLevel++; // Спускається на рівень глибше
      
      // Ручний пошук пар ключ="значення" за допомогою регулярного виразу
      let attrRegex = /([a-zA-Z0-9_]+)\s*=\s*"([^"]*)"/g;
      let match;
      let attrs = {};
      
      // Проходить по всіх знайдених атрибутах всередині тегу
      while ((match = attrRegex.exec(tagContent)) !== null) {
        // match[1] — назва атрибута, match[2] — його значення
        // Тут викликає unescapeXml для обробки спецсимволів
        attrs[match[1]] = unescapeXml(match[2]);
      }
      
      // Формує рядки для GTR Порядок перевірки гарантує правильний вивід
      if (attrs['name']) result.push(`${currentLevel} NAME ${attrs['name']}`);
      if (attrs['surname']) result.push(`${currentLevel} SURNAME ${attrs['surname']}`);
      if (attrs['sex']) result.push(`${currentLevel} SEX ${attrs['sex']}`);
      if (attrs['birth']) result.push(`${currentLevel} BIRTH ${attrs['birth']}`);
      
      // Якщо тег не має нащадків і закрився сам у собі,
      // одразу зменшує рівень, щоб наступна людина була на тому ж рівні
      if (isSelfClosing) {
        currentLevel--;
      }
    }
  }
  
  return result.join('\n');
}