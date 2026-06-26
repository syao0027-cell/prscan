// ================================
// データ読み込み
// ================================
let scans = JSON.parse(localStorage.getItem("scans")) || [];

let qr = null;

// 初期件数表示
updateCount();


// ================================
// ホーム → スキャナー
// ================================
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
    )
    .catch(err => {

        alert(
            "カメラを起動できませんでした。\n" +
            "カメラの使用を許可してください。"
        );

        console.error(err);

        goHome();
    });

}


// ================================
// スキャナー → ホーム
// ================================
function goHome(){

    document.getElementById("scanPage").classList.remove("active");
    document.getElementById("homePage").classList.add("active");

    if(qr){

        qr.stop()
        .then(() => {

            qr.clear();

            qr = null;

        })
        .catch(err => console.log(err));

    }

    updateCount();

}



// ================================
// ホーム → 一覧
// ================================
function showList(){

    document.getElementById("homePage").classList.remove("active");
    document.getElementById("listPage").classList.add("active");

    renderTable();

}



// ================================
// 一覧 → ホーム
// ================================
function backHomeFromList(){

    document.getElementById("listPage").classList.remove("active");
    document.getElementById("homePage").classList.add("active");

}



// ================================
// ホーム → 設定
// ================================
function openSettings(){

    document.getElementById("homePage").classList.remove("active");
    document.getElementById("settingsPage").classList.add("active");

}



// ================================
// 設定 → ホーム
// ================================
function closeSettings(){

    document.getElementById("settingsPage").classList.remove("active");
    document.getElementById("homePage").classList.add("active");

}



// ================================
// QR読取成功
// ================================
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

    // 新規登録
    scans.unshift({

        datetime : new Date().toLocaleString("ja-JP"),

        code : decodedText

    });

    saveData();

    // 音
    const beep = document.getElementById("beep");

    if(beep){
        beep.play().catch(()=>{});
    }

    // バイブ
    navigator.vibrate?.(200);

    // メッセージ
    showScanMessage(
        "✓ 読み取りました"
    );

    updateCount();

}



// ================================
// メッセージ表示
// ================================
function showScanMessage(text, duplicate=false){

    const msg =
        document.getElementById("scanMessage");

    msg.textContent = text;

    if(duplicate){

        msg.classList.add("duplicate");

    }else{

        msg.classList.remove("duplicate");

    }

    msg.style.display = "block";

    setTimeout(() => {

        msg.style.display = "none";

    },1000);

}



// ================================
// 一覧表示
// ================================
function renderTable(){

    const tbody =
        document.getElementById("history");

    tbody.innerHTML = "";

    scans.forEach(scan => {

        tbody.innerHTML += `
            <tr>
                <td>${scan.datetime}</td>
                <td>${scan.code}</td>
            </tr>
        `;

    });

}



// ================================
// 件数更新
// ================================
function updateCount(){

    document.getElementById("count").textContent =
        scans.length;

}



// ================================
// 保存
// ================================
function saveData(){

    localStorage.setItem(
        "scans",
        JSON.stringify(scans)
    );

}



// ================================
// Excel出力
// ================================
function exportExcel(){

    if(scans.length === 0){

        alert("出力するデータがありません");

        return;
    }

    const data = scans.map(s => ({

        "日時": s.datetime,
        "来場者ID": s.code

    }));

    const ws =
        XLSX.utils.json_to_sheet(data);

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



// ================================
// バックアップ
// ================================
function backupData(){

    const blob = new Blob(
        [JSON.stringify(scans)],
        {
            type : "application/json"
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



// ================================
// 復元
// ================================
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

        }
        catch{

            alert("復元に失敗しました");

        }

    };

    reader.readAsText(file);

}



// ================================
// 確認ポップ
// ================================
function confirmExcel(){

    if(confirm(
        "Excelファイルを出力しますか？"
    )){

        exportExcel();

    }

}



function confirmBackup(){

    if(confirm(
        "バックアップを作成しますか？"
    )){

        backupData();

    }

}



function confirmRestore(){

    if(confirm(
        "バックアップから復元しますか？\n現在のデータは上書きされます。"
    )){

        document
            .getElementById("restoreFile")
            .click();

    }

}



function confirmDelete(){

    if(confirm(
        "全データを削除しますか？\nこの操作は元に戻せません。"
    )){

        scans = [];

        saveData();

        updateCount();

        renderTable();

        alert("全データを削除しました");

    }

}
