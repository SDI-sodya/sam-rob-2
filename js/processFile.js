// ========== Основна функція оброки файлу ==========
export function processFile(){
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
