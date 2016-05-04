
// Web MIDI API実装チェック + MIDI IN/OUTデバイス存在チェック
// [前提] 呼び出し元のアプリが、以下のタイプであること。
//        ・MIDI IN/OUTデバイスがあるときのみ正常動作する
//        ・MIDI IN/OUTデバイスがないときは正常動作しない
// [仕様] ブラウザがWeb MIDI APIを実装していないか、
//        MIDI IN/OUTデバイスがないときは、
//        画面に警告を表示する
//        （htmlに、document.writeln()する）。
// [補足] ユーザに状況が伝わりさえすればよいので、画面崩れ等、体裁は考慮しないものとする。

(function () {

  var msgNg = [
    "お使いのブラウザはWeb MIDI APIに対応していません。",
    "取り急ぎ、Chromeで同じページを開いてみてください。"
    ];
  var msgNoDeviceIn = [
    "お使いのブラウザはWeb MIDI APIに対応していますが、",
    "MIDI Inputデバイスが1つも検出されませんでした。"
    ];
  var msgNoDeviceOut = [
    "お使いのブラウザはWeb MIDI APIに対応していますが、",
    "MIDI Outputデバイスが1つも検出されませんでした。"
    ];
  var msgNoDeviceCommon = [
    "----",
    "USBで接続できるMIDI楽器や、",
    "USB-MIDIケーブルや、",
    "loopMIDIによる仮想MIDIデバイスを、",
    "1つ以上ご用意ください。",
    "----",
    "また、用意したデバイスが検出されなかった場合は、",
    "ページのリロードと、",
    "Chrome再起動をお試しください。",
    "Chrome再起動の際は、Chromeとタスクトレイ上のChromeとChrome Dev Editorを全て閉じてから再起動をしてください。",
    "loopMIDIのportを2つ用意したのに1つしか検出されなかった場合も、リロードをお試しください。"
    ];

  // ブラウザがWeb MIDI APIを実装しているか、チェック
  if (!navigator.requestMIDIAccess) {
    writeArr(msgNg);
    return;
  }

  // MIDI InputデバイスとMIDI Outputデバイスを1個以上検出できたか、チェック
  navigator.requestMIDIAccess({sysex:false}).then(successCallback, errorCallback);

  // 非同期処理
  // Web MIDI API requestMIDIAccess成功
  function successCallback(access) {

    // MIDI Inputデバイスの一覧を作成
    var inputCtr = 0;
    var inputIterator = access.inputs.values();
    for (var i = inputIterator.next(); !i.done; i = inputIterator.next()) {
      inputCtr++;
    }
    if (!inputCtr) {
      // MIDI Inputデバイスがない
      writeArr(msgNoDeviceIn);
      writeArr(msgNoDeviceCommon);
      return;
    }

    // MIDI outputデバイスの一覧を作成
    var outputCtr = 0;
    var outputIterator = access.outputs.values();
    for (var o = outputIterator.next(); !o.done; o = outputIterator.next()) {
      outputCtr++;
    }
    if (!outputCtr) {
      // MIDI outputデバイスがない
      writeArr(msgNoDeviceOut);
      writeArr(msgNoDeviceCommon);
      return;
    }
  }

  // 非同期処理
  // Web MIDI API requestMIDIAccessエラー
  function errorCallback(msg) {
    writeMsg("[ERROR] " + msg);
  }

  // utils
  // 画面出力
  function writeArr(a) {
    for (var i = 0; i < a.length; i++) writeMsg(a[i]);
  }
  function writeMsg(v) {
    document.writeln('<h1>' + v + '</h1>');
  }

}).call(this);
