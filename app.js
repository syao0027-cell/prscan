// ==========================
// データ読込
// ==========================
let scans = JSON.parse(localStorage.getItem("scans")) || [];

let qr = null;

// 初期表示
updateCount();


// ==========================
// スキャナー起動
// ==========================
function openScanner(){

    document.getElementById("homePage").classList.remove("active");
    document.getElementById("scanPage").classList.add("active");

    if(qr) return;

    qr = new Html5Qrcode("reader");

    qr.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: 250
        },
        onScanSuccess
    ).catch(err=>{
        alert("カメラを起動できませんでした。\nカメラの許可を確認してください。");
        console.error(err);
    });
}


// ==========================
// ホームへ戻る
// ==========================
function goHome(){

    document.getElementById("scanPage").classList.remove("active");
    document.getElementById("homePage").classList.add("active");

    if(qr){

        qr.stop()
        .then(()=>{

            qr.clear();

            qr = null;

        })
        .catch(err=>{
            console.log(err);
        });

    }

    updateCount();
}



// ==========================
// 一覧表示
// ==========================
function showList(){

    document.getElementById("homePage").classList.remove("active");
    document.getElementById("listPage").classList.add("active");

    renderTable();
}


// ==========================
// 一覧→ホーム
// ==========================
function backHomeFromList(){

    document.getElementById("listPage").classList.remove("active");
    document.getElementById("homePage").classList.add("active");

    updateCount();
}



// ==========================
// QR読取成功
// ==========================
function onScanSuccess(decodedText){

    // 重複チェック
    if(scans.some(s => s.code === decodedText)){

        navigator.vibrate?.([100,100,100]);

        showScanMessage(
            "⚠ 重複しています",
            true
        );

        return;
    }

    // データ追加
    scans.unshift({

        datetime:
            new Date().toLocaleString("ja-JP"),

        code:
            decodedText

    });

    saveData();

    document.getElementById("beep").play();

    navigator.vibrate?.(200);

    showScanMessage("✓ 読み取りました");

    updateCount();

}



// ==========================
// メッセージ表示
// ==========================
function showScanMessage(text, duplicate = false){

    const msg =
        document.getElementById("scanMessage");

    msg.textContent = text;

    if(duplicate){

        msg.classList.add("duplicate");

    }else{

        msg.classList.remove("duplicate");

    }

    msg.style.display = "block";

    setTimeout(()=>{

        msg.style.display = "none";

    },1000);

}



// ==========================
// テーブル表示
// ==========================
function renderTable(){

    const tbody =
        document.getElementById("history");

    tbody.innerHTML = "";

    scans.forEach(scan=>{

        tbody.innerHTML += `
            <tr>
                <td>${scan.datetime}</td>
                <td>${scan.code}</td>
            </tr>
        `;

    });

}



// ==========================
// 件数更新
// ==========================
function updateCount(){

    document.getElementById("count").textContent =
        scans.length;

}



// ==========================
// 保存
// ==========================
function saveData(){

    localStorage.setItem(
        "scans",
        JSON.stringify(scans)
    );

}



// ==========================
// Excel出力
// ==========================
function exportExcel(){

    if(scans.length === 0){

        alert("データがありません");

        return;
    }

    const excelData = scans.map(s => ({

        "日時": s.datetime,
        "来場者ID": s.code

    }));


    const ws =
        XLSX.utils.json_to_sheet(excelData);

    const wb =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        wb,
        ws,
        "来場者一覧"
    );

    XLSX.writeFile(
        wb,
        "展示会来場者一覧.xlsx"
    );

}



// ==========================
// バックアップ
// ==========================
function backupData(){

    const blob = new Blob(
        [JSON.stringify(scans)],
        {
            type:"application/json"
        }
    );

    const a =
        document.createElement("a");

    a.href =
        URL.createObjectURL(blob);

    a.download =
        "visitor_backup.json";

    a.click();

}



// ==========================
// 復元
// ==========================
function restoreBackup(event){

    const file =
        event.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        try{

            scans =
                JSON.parse(e.target.result);

            saveData();

            updateCount();

            alert("復元しました");

        }catch{

            alert("復元に失敗しました");

        }

    };

    reader.readAsText(file);

}