function fele(){
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if(!file){
        alert("не той файл")
        return;
    }
    
    const reader = new FileReader();

    reader.onload = function(e){
        const text = e.target.result;
        const xml = convert(text);
        document.getElementById("output").textContent = xml;
    };
    reader.readAsText(file);
}
function converter(data){
    let lines = data.split("\n");
    let xml = '<tree>\n';

    lines.forEach(line => {
        xml += `<!--${line.trim()} -->\n`;
    });

    xml += `</tree>`;
    return xml;
}