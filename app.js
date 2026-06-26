let scans = JSON.parse(localStorage.getItem("scans")) || [];

renderTable();

const qr = new Html5Qrcode("reader");

qr.start(
    { facingMode: "environment" },
    {
        fps: 10,
        qrbox: 250
    },
    onScanSuccess
);

function onScanSuccess(decodedText){

    // 重複防止
    if(scans.some(s => s.code === decodedText)){
        return;
    }

    const now = new Date();

    const record = {
        datetime: now.toLocaleString('ja-JP'),
        code: decodedText
    };

    scans.unshift(record);

    localStorage.setItem("scans", JSON.stringify(scans));

    renderTable();

    navigator.vibrate?.(200);
}

function renderTable(){

    const tbody = document.getElementById("history");

    tbody.innerHTML = "";

    scans.forEach(scan => {

        tbody.innerHTML += `
        <tr>
            <td>${scan.datetime}</td>
            <td>${scan.code}</td>
        </tr>
        `;
    });

    document.getElementById("count").textContent = scans.length;
}

function exportCSV(){

    let csv = "日時,来場者ID\n";

    scans.forEach(scan=>{
        csv += `${scan.datetime},${scan.code}\n`;
    });

    const blob = new Blob(
        ["\uFEFF"+csv],
        {type:"text/csv"}
    );

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "来場者一覧.csv";
    a.click();
}

function clearData(){

    if(confirm("全データを削除しますか？")){

        scans = [];

        localStorage.removeItem("scans");

        renderTable();
    }
}