angular.module('generatorApp')
.controller('generatorController', ['$scope', '$location', '$timeout', 'GeneratorService','WebMIDIApiService','Utils',
function($scope, $location, $timeout, GeneratorService, WebMIDIApiService, Utils) {

// [説明] 簡易ランダムシーケンス生成器。画面入力したパターンをランダム切り替えしてシーケンスを生成し、
//        MIDI INのノートオンをトリガとして演奏する。
// [用途] ランダムシーケンスを生成したいときに利用。
// [使用方法] DAWで、トラックを用意し、それをブラウザのMIDI INへ接続する。
//            [クロマチックスケールモード]
//               チェックボックスをonにすることで使用可能。デフォルト。
//               主音を鳴らすだけで演奏できる。
//            [スケール可変モード]
//               チェックボックスをoffにすることで使用可能。
//               [メリット] 曲中でドリアンスケールからエオリアンスケールに変更、といった場合、
//                          スケールに沿ったシーケンスを生成できる。
//               [利用法] DAWで演奏するのは、主音だけでなく、スケールの構成音全てとなる。
//                        主音だけ演奏した場合は、音が鳴らない。
//               [制約] 全てのパターンの"scale:"の音数が同じこと。7音音階と12音音階の混在はできない。
//                      想定は、7音音階のパターンを複数登録しての利用。

  $scope.p = {"bpm":106, "fixMode":0, "chgPtnFreq":4, "ptnStr":[], "timeOfRepeat":2, "groupSetSize":4, "sNOnMd":true};
  var midi = {"inputs":[], "outputs":[]};
  $scope.midi = midi; // 画面に公開
  var inputSelIdx = null;
  var outputSelIdx = null;
  var notes = [];

  // Web MIDI API初期化
  navigator.requestMIDIAccess({sysex:false}).then(successCallback, WebMIDIApiService.errorCallback);

  // 非同期処理（Web MIDI API初期化成功時）
  function successCallback(access) {
    // MIDI Inputデバイスの配列を作成
    midi.inputs = WebMIDIApiService.createMidiInputs(access, midi.inputs);
    // MIDI Outputデバイスの配列を作成
    midi.outputs = WebMIDIApiService.createMidiOutputs(access, midi.outputs);
    // 画面へデータを反映
    $scope.$apply(function () {
    });
  }

  // MIDI Inputデバイスのプルダウン選択時
  $scope.selectMidiInputs = function() {
    // イベント解除
    if(parseInt(inputSelIdx) >= 0) {
      midi.inputs[inputSelIdx].onmidimessage = null;
    }
    inputSelIdx = parseInt(($scope.midiInput.id).replace(/\D/g, "")) - 1; // oldを解除する為、$scopeとは別に保持
    // イベント登録
    midi.inputs[inputSelIdx].onmidimessage = eventOut;
  }
  // MIDI Outputデバイスのプルダウン選択時
  $scope.selectMidiOutputs = function() {
    outputSelIdx = parseInt(($scope.midiOutput.id).replace(/\D/g, "")) - 1;
  }

  // 非同期処理（MIDI受信時）
  is1stEvent = true;
  function eventOut(event) {
    // note配列に追加と削除（ランダムシーケンス生成用のスケールとして利用）
    if (event.data[0] == 0x90) {
      if (event.data[2]) {
        // ノートオン
        addNotes(event.data[1], event.data[2]);
      } else {
        delNotes(event.data[1]);
      }
    } else if (event.data[0] == 0x80) {
      delNotes(event.data[1]);
    }
    function addNotes(note, vel) {
      notes[note] = vel;
      startSeq();
    }
    function delNotes(note) {
      delete notes[note];
    }
    function startSeq() {
      if (!is1stEvent) return;
      if (!$scope.p.sNOnMd) { // MIDI INでスケールを選べるときは
        if (countMidiInSOfSRaw() < numOfScale()) return;  // 全てのスケール用ノートが揃うまでは反応しない
      }
      // 最初のMIDI IN入力の場合
      clearPlayIdxes();
      evt_update(); // 最初の１つを演奏
      setSeqInterval(); // 2つ目からはintervalで鳴らす
      is1stEvent = false;
    }

    // MIDIメッセージを表示 [補足] 鳴らす反応を優先させる為、処理の後ろに置いてある
    for(var i = 0, out = []; i<event.data.length; i++) out.push(("00"+event.data[i].toString(16)).substr(-2));
    var div_msg = document.getElementById("msg");
    var ex_msg = div_msg.innerHTML.split("<br>");
    while(ex_msg.length>19) ex_msg.pop();
    div_msg.innerHTML = out.join(" ")+"<br>" + ex_msg.join("<br>");
  }

  // 元シーケンス定義
  var ptns;
  var beats = 32;
  var ptnArr;
  $scope.initPtnStr = function() {
    $scope.p.ptnStr =
      "[\n" +
      "{\"comment\":\"ptn 1\",\n" +
      "\"scale\":[0,1, 2,3, 4, 5,6, 7,8, 9,10, 11],\n" +
      "\"deg\": [0, 0, 7, 7,  5, 5,10,10, 10, 3, 5, 5,  0, 0, 7, 7,\n" +
      "        5, 5,10,10, 10, 3, 5, 7,  8, 7, 8,10,  5, 3, 2, 2],\n" +
      "\"oct\": [1, 1, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  1, 1, 0, 0,\n" +
      "        0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],\n" +
      "\"rest\":[0, 1, 0, 1,  0, 1, 0, 0,  1, 0, 0, 1,  0, 1, 0, 1,\n" +
      "        0, 1, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 1],\"degSft\":0}\n" +
      ",\n" +
      "{\"comment\":\"ptn 2\",\n" +
      "\"scale\":[0,1, 2,3, 4, 5,6, 7,8, 9,10, 11],\n" +
      "\"deg\": [0, 0, 5, 5,  7, 7,10,10,  0, 0, 5, 5,  7, 7, 0, 0,\n" +
      "        0, 0, 5, 5,  7, 7, 2, 2,  0, 0, 5, 5,  7, 7, 0, 0],\n" +
      "\"oct\": [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 1, 1,\n" +
      "        0, 0, 0, 0,  0, 0, 1, 1,  0, 0, 0, 0,  0, 0, 1, 1],\n" +
      "\"rest\":[0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1,\n" +
      "        0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1],\"degSft\":0}\n" +
      ",\n" +
      "{\"comment\":\"ptn 3\",\n" +
      "\"scale\":[0,1, 2,3, 4, 5,6, 7,8, 9,10, 11],\n" +
      "\"deg\": [0, 0, 7, 7,  5, 5, 0, 0, 10,10, 8, 8,  7, 7, 5, 5,\n" +
      "        0, 0, 7, 7,  5, 5, 0, 0, 10,10, 8, 8,  0, 0, 3, 3],\n" +
      "\"oct\": [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,\n" +
      "        0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],\n" +
      "\"rest\":[0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1,\n" +
      "        0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1],\"degSft\":0}\n" +
      "]";
    $scope.changePtnStr();
  }
  $scope.changePtnStr = function() {
    ptnArr = angular.fromJson($scope.p.ptnStr);
    ptns = ptnArr.length;
  }
  var playIdx = 0;  // シーケンスの何個目の音符か
  var playPtnIdx = 0; // 何番のパターンか
  var playGrpSetRepIdx = 0; // 生成結果 ptnIndexRep の何番目の音符か
  // 非同期処理（interval）
  function evt_update() {
    if(parseInt(outputSelIdx) < 0) return;  // MIDI OUTが1つもない
    if (!ptnIndexes.length || !ptnIndexes[0].length) {
      clearPlayIdxes();
      return; // テキストボックス編集中で、生成結果が空の時
    }
    var sOfSRaw = countMidiInSOfSRaw();  // size of scale
    var sOfSc = calcSOfSc(sOfSRaw);
    if (!sOfSRaw) { // 発音されていないならとめる
      clearInterval(m_hTimer);  // 次のノートオンにすぐ反応して鳴らせるよう、シーケンスをとめる
      is1stEvent = true;  // 次のノートオンにすぐ反応して鳴らせるよう、フラグを立てる
      return;
    }
    // MIDIメッセージを送信
    play1();
    // 演奏位置更新
    playIdx++;
    if (playIdx >= beats) playIdx = 0;
    // 演奏パターンidx更新
    playPtnIdx = ptnIndexRep[playGrpSetRepIdx];
    playGrpSetRepIdx++;
    if (playGrpSetRepIdx >= ptnIndexRep.length) playGrpSetRepIdx = 0;

    function play1() {
      if (ptnArr[playPtnIdx]['rest'][playIdx]) return;  // 休符
      var de1 = ptnArr[playPtnIdx]['deg'][playIdx] + ptnArr[playPtnIdx]['degSft'];  // [イメージ] -1 や 0 や 1 や 7。degSftはdegreeShift
      var deg = ((de1 % sOfSc) + sOfSc) % sOfSc;  // [イメージ] 0～6、クロマチックスケールなら0～11
      // デフォルトスケールを使用する場合
      if ($scope.p.sNOnMd) {
        var firstNoteNum = get1stNoteNum();
        var baseNoteNum = firstNoteNum + ptnArr[playPtnIdx]["scale"][deg];
        var vel = notes[firstNoteNum];
        sendNoteOn(baseNoteNum, vel);
        return;
      }
      // スケールをMIDI INで指定する場合
      // MIDI INから入力された複数ノートのうち、ランダムパターンで選んだ度数の音のみ、MIDI OUTにノートオン送信する
      var ctr = 0;
      for (key in notes) { // [補足] このkeyは音楽的な意味でなく、JavaScript的な意味
        if (ctr == deg) {
          var baseNoteNum = key;
          sendNoteOn(baseNoteNum, notes[key]);
          return;
        }
        ctr++;
      }
      function sendNoteOn(baseNoteNum, vel) {
        var octOfs = ptnArr[playPtnIdx]['oct'][playIdx] + Math.floor(de1 / sOfSc); // [イメージ] -1 や 0 や 1
        var noteNum = parseInt(baseNoteNum) + octOfs * 12;
        midi.outputs[outputSelIdx].send([0x90, noteNum, vel]);
        midi.outputs[outputSelIdx].send([0x80, noteNum, vel], window.performance.now() + stepTimeMsec);
      }
    }
    function calcSOfSc(sOfSRaw) { // size of scale
      if ($scope.p.sNOnMd) return ptnArr[playPtnIdx]["scale"].length; // [補足] 16分音符ごとにパターンが変わるので、毎回取得が必要
      return sOfSRaw;
    }
  }
  // MIDI INで入力されたスケールのサイズを得る [イメージ] MIDI INから入力されたのが1音なら、1を得る
  function countMidiInSOfSRaw() { // count size of scale
    var ctr = 0;
    for (key in notes) ctr++;
    return ctr;
  }
  function get1stNoteNum() {
    for (key in notes) return parseInt(key);
  }
  function clearPlayIdxes() {
    playIdx = 0;
    playGrpSetRepIdx = 0;
    playPtnIdx = 0;
  }

  var beatnote = 16; // 16分音符以外で使うことはなさそうなので$scope.pには入れない。$scope.pには画面と相互バインディングしたいものだけ入れる
  var stepTimeMsec = calcStepTimeMsec($scope.p.bpm, beatnote);
  // テキストボックス編集時
  $scope.generate = function() {
    var bpm = $scope.p.bpm; // 画面への反映はしない。例えば、BPMを90から80にしたいとき、テキストボックス上は空欄、内部的にはBPM1、にしたいので。
    if (!bpm) bpm = 1;  // BPM0にしない（割り込み周期無限大はエラーになるので）
    if (bpm < 1) bpm = 1;
    // BPMから割り込み周期を算出する
    stepTimeMsec = calcStepTimeMsec(bpm, beatnote);
    // 割り込みを設定する
    setSeqInterval();
  }

  // 演奏位置初期化ボタンクリック時
  $scope.resetIdx = function() {
    playIdx = 0;
  }

  // パターン選択のランダム生成を行う
  var ptnIndexes = [];
  var ptnIndexRep = []; // repeat分
  $scope.createPtnIndexes = function() {
    var iGrpSet; // index of group set
    var igi; // index : 1groupSet内の、index
    var gs; // group set
    var idxPlyPtn = 0;
    ptnIndexes = [];
    for (iGrpSet = 0; iGrpSet < $scope.p.groupSetSize; iGrpSet++) {  // [イメージ] 4セット作るなら4loop
      gs = [];
      for (igi = 0; igi < $scope.numOfDeg(); igi++) {  // [イメージ] 32個なら32loop
        // パターン選択、再選択。出力は、0なら1つめのパターンを意味する
        if ($scope.p.fixMode) {
          if ($scope.p.fixMode > 0 && $scope.p.fixMode <= ptns) idxPlyPtn = $scope.p.fixMode - 1;
          else idxPlyPtn = 0;
        } else {
          var f = 4;   // デフォルト : 1/4の確率でパターン再選択
          if ($scope.p.chgPtnFreq >= 1) f = $scope.p.chgPtnFreq - 1;
          if (!Utils.getRandomInt(0, f)) idxPlyPtn = Utils.getRandomInt(0, ptns - 1);
        }
        gs.push(idxPlyPtn);
      }
      ptnIndexes.push(gs);
    }
    $scope.p.ptnIndexesStr = angular.toJson(ptnIndexes); // 画面で表示して確認
    $scope.createPtnIndexRep();
    playIdx = 0;  // 結果が前より短くなってもよいよう
    playGrpSetRepIdx = 0;
  }
  // パターン選択のランダム生成結果を編集時、内部データに反映する
  $scope.changePtnIndexesStr = function() {
    ptnIndexes = angular.fromJson($scope.p.ptnIndexesStr);
    $scope.createPtnIndexRep();
  }
  // リピート分を含めた内部データを生成する
  function createPtnIndexRep(src) {
    var dst = [];
    angular.forEach(src, function(s1) {
      for (var i = 0; i < $scope.p.timeOfRepeat; i++) {
        angular.forEach(s1, function(s2) {
          dst.push(s2);
        });
      }
    });
    return dst;
  }
  $scope.createPtnIndexRep = function(){
    ptnIndexRep = createPtnIndexRep(ptnIndexes);
    $scope.ptnIndexReStr = angular.toJson(ptnIndexRep); // 画面で表示して確認
  }
  $scope.numOfDeg = function() {  // 画面に公開
    if (!ptnArr.length) return 0;
    return ptnArr[0]["deg"].length;
  }
  // 画面入力されたパターンのスケールの音数 [イメージ] クロマチックスケールなら12
  function numOfScale() {
    if (!ptnArr.length) return 0;
    return ptnArr[0]["scale"].length;
  }

  // 初期処理
  $scope.initPtnStr();
  $scope.createPtnIndexes();

  // 割り込みを設定する
  var m_hTimer;
  function setSeqInterval() {
    clearInterval(m_hTimer);
    m_hTimer = setInterval(evt_update, stepTimeMsec);
  }
  // BPMから割り込み周期を算出する
  function calcStepTimeMsec(bpm, beatnote) {
    return 1000 * 60 * 4 / bpm / beatnote;
  }

}]);
