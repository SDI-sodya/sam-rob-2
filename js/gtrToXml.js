import { escapeXml } from './helpers.js'

// ========== Конвертер з .gtr в .xml ==========
export function gtrToXml(data) {
  const lines = data
    .split('\n')
    .map(line => line.trim())
    .filter(line => line);

  const roots = [];
  const stack = [];

  let currentPerson = null;

  for (const line of lines) {
    const parts = line.split(/\s+/);

    if (parts.length < 3) continue;

    const level = parseInt(parts[0]);
    const tag = parts[1];
    const value = parts.slice(2).join(' ');

    // Нова людина
    if (tag === 'NAME') {
      const person = {
        level,
        name: value,
        surname: '',
        sex: '',
        birth: '',
        children: []
      };

      // Знаходимо правильного батька
      while (stack.length && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length === 0) {
        roots.push(person);
      } else {
        stack[stack.length - 1].children.push(person);
      }

      stack.push(person);
      currentPerson = person;
    }
    else {
      // Властивості належать останній знайденій людині
      if (!currentPerson) continue;

      switch (tag) {
        case 'SURNAME':
          currentPerson.surname = value;
          break;

        case 'SEX':
          currentPerson.sex = value;
          break;

        case 'BIRTH':
          currentPerson.birth = value;
          break;
      }
    }
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<genealogy>\n';

  for (const person of roots) {
    xml += personToXml(person, 1);
  }

  xml += '</genealogy>';

  return xml;
}

function personToXml(person, indent) {
  const space = '  '.repeat(indent);

  let xml = `${space}<person`;

  xml += ` name="${escapeXml(person.name)}"`;
  xml += ` surname="${escapeXml(person.surname)}"`;
  xml += ` sex="${escapeXml(person.sex)}"`;
  xml += ` birth="${escapeXml(person.birth)}"`;

  xml += '>\n';

  if (person.children.length > 0) {
    xml += `${space}  <children>\n`;

    for (const child of person.children) {
      xml += personToXml(child, indent + 2);
    }

    xml += `${space}  </children>\n`;
  }

  xml += `${space}</person>\n`;

  return xml;
}