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

    const msg = document.getElementById("message");
    const last = document.getElementById("lastCode");

    if(scans.some(s => s.code === decodedText)){

        msg.textContent = "⚠ 重複データ";
        msg.className = "duplicate";

        last.textContent = decodedText;

        navigator.vibrate?.([100,100,100]);

        return;
    }

    const record = {
        datetime:new Date().toLocaleString("ja-JP"),
        code:decodedText,
        rank:"",
        memo:""
    };

    scans.unshift(record);

    saveData();

    document.getElementById("beep").play();

    navigator.vibrate?.(200);

    msg.textContent = "✓ 登録完了";
    msg.className = "success";

    last.textContent = decodedText;

    renderTable();
}

function saveData(){
    localStorage.setItem("scans", JSON.stringify(scans));
}

function renderTable(){

    const tbody = document.getElementById("history");

    const keyword =
        document.getElementById("search").value;

    const onlyA =
        document.getElementById("onlyA").checked;

    tbody.innerHTML = "";

    let filtered = scans.filter(s=>{

        let ok = true;

        if(keyword){
            ok = s.code.includes(keyword);
        }

        if(onlyA){
            ok = ok && s.rank==="A";
        }

        return ok;
    });

    filtered.forEach((scan,index)=>{

        let cls="";

        if(scan.rank==="A") cls="rankA";
        if(scan.rank==="B") cls="rankB";
        if(scan.rank==="C") cls="rankC";

        tbody.innerHTML += `
        <tr class="${cls}">
            <td>${scan.datetime}</td>
            <td>${scan.code}</td>

            <td>
            <select onchange="changeRank('${scan.code}',this.value)">
                <option value="" ${scan.rank==""?"selected":""}></option>
                <option value="A" ${scan.rank=="A"?"selected":""}>A</option>
                <option value="B" ${scan.rank=="B"?"selected":""}>B</option>
                <option value="C" ${scan.rank=="C"?"selected":""}>C</option>
            </select>
            </td>

            <td>
            <input class="memo"
                   value="${scan.memo}"
                   onchange="changeMemo('${scan.code}',this.value)">
            </td>
        </tr>
        `;
    });

    document.getElementById("count").textContent =
        scans.length;
}

function changeRank(code,value){

    const target = scans.find(s=>s.code===code);

    target.rank = value;

    saveData();

    renderTable();
}

function changeMemo(code,value){

    const target = scans.find(s=>s.code===code);

    target.memo = value;

    saveData();
}

function exportCSV(){

    let csv =
        "日時,来場者ID,ランク,メモ\n";

    scans.forEach(scan=>{

        csv +=
        `"${scan.datetime}","${scan.code}","${scan.rank}","${scan.memo}"\n`;

    });

    const blob = new Blob(
        ["\uFEFF"+csv],
        {type:"text/csv"}
    );

    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);

    a.download = "展示会来場者一覧.csv";

    a.click();
}

function clearData(){

    if(confirm("全件削除しますか？")){

        scans = [];

        localStorage.removeItem("scans");

        renderTable();

        document.getElementById("message").textContent="";
        document.getElementById("lastCode").textContent="";
    }
}