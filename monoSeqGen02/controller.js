angular.module('generatorApp')
.controller('generatorController', ['$scope', '$location', '$timeout', 'GeneratorService','WebMIDIApiService','Utils',
function($scope, $location, $timeout, GeneratorService, WebMIDIApiService, Utils) {

// [説明] 簡易ランダムシーケンス生成器。入力したパターンをランダム切り替えしてシーケンスを生成する。
// [用途] スケールにあわせたランダムシーケンスを生成したいときに利用。
// [使用方法] DAWで、使っている曲のスケール（例：レミファソラシド）を和音で演奏し、
//            ブラウザのMIDI INに入力する。なお、7和音のみ対応している。それ以外の動作は未定義。

  $scope.p = {"bpm":106, "fixMode":0, "chgPtnFreq":4, "ptnStr":[]};
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
    inputSelIdx = $scope.midiInput.id; // oldを解除する為、$scopeとは別に保持
    // イベント登録
    midi.inputs[inputSelIdx].onmidimessage = eventOut;
  }
  // MIDI Outputデバイスのプルダウン選択時
  $scope.selectMidiOutputs = function() {
    outputSelIdx = $scope.midiOutput.id;
  }

  // 非同期処理（MIDI受信時）
  function eventOut(event) {
    // MIDIメッセージを表示
    for(var i = 0, out = []; i<event.data.length; i++) out.push(("00"+event.data[i].toString(16)).substr(-2));
    var div_msg = document.getElementById("msg");
    var ex_msg = div_msg.innerHTML.split("<br>");
    while(ex_msg.length>19) ex_msg.pop();
    div_msg.innerHTML = out.join(" ")+"<br>" + ex_msg.join("<br>");
    // note配列に追加と削除（ランダムシーケンス生成用のスケールとして利用）
    if (event.data[0] == 0x90) {
      if (event.data[2]) {
        addNotes(event.data[1], event.data[2]);
      } else {
        delNotes(event.data[1]);
      }
    } else if (event.data[0] == 0x80) {
      delNotes(event.data[1]);
    }
    function addNotes(note, vel) {
      notes[note] = vel;
    }
    function delNotes(note) {
      delete notes[note];
    }
  }

  // 元シーケンス定義
  var ptns;
  var beats = 32;
  var ptnArr;
  $scope.initPtnStr = function() {
    $scope.p.ptnStr =
      "[\n" +
      "{\"deg\":[0, 0, 7, 7,  5, 5,10,10, 10, 3, 5, 5,  0, 0, 7, 7,\n" +
      "        5, 5,10,10, 10, 3, 5, 7,  8, 7, 8,10,  5, 3, 2, 2],\n" +
      "\"oct\": [1, 1, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  1, 1, 0, 0,\n" +
      "        0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],\n" +
      "\"rest\":[0, 1, 0, 1,  0, 1, 0, 0,  1, 0, 0, 1,  0, 1, 0, 1,\n" +
      "        0, 1, 0, 0,  1, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 1],\"degSft\":0}\n" +
      ",\n" +
      "{\"deg\":[0, 0, 5, 5,  7, 7,10,10,  0, 0, 5, 5,  7, 7, 0, 0,\n" +
      "        0, 0, 5, 5,  7, 7, 2, 2,  0, 0, 5, 5,  7, 7, 0, 0],\n" +
      "\"oct\": [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 1, 1,\n" +
      "        0, 0, 0, 0,  0, 0, 1, 1,  0, 0, 0, 0,  0, 0, 1, 1],\n" +
      "\"rest\":[0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1,\n" +
      "        0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1],\"degSft\":0}\n" +
      ",\n" +
      "{\"deg\":[0, 0, 7, 7,  5, 5, 0, 0, 10,10, 8, 8,  7, 7, 5, 5,\n" +
      "        0, 0, 7, 7,  5, 5, 0, 0, 10,10, 8, 8,  0, 0, 3, 3],\n" +
      "\"oct\": [0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,\n" +
      "        0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0],\n" +
      "\"rest\":[0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1,\n" +
      "        0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1,  0, 1, 0, 1],\"degSft\":0}\n" +
      "\n]";
    $scope.changePtnStr();
  }
  $scope.changePtnStr = function() {
    ptnArr = angular.fromJson($scope.p.ptnStr);
    ptns = ptnArr.length;
  }
  var playIdx = 0;
  var playPtnIdx = 0;
  // 非同期処理（interval）
  function evt_update() {
    if(parseInt(outputSelIdx) < 0) return;  // MIDI OUTが1つもない
    var sOfSc = countSOfSc();  // size of scale
    if (!sOfSc) { // 発音されていない
      playIdx = 0;
      return;
    }
    // MIDIメッセージを送信
    play1();
    playIdx++;
    if (playIdx >= beats) playIdx = 0;

    if ($scope.p.fixMode) {
      if ($scope.p.fixMode > 0 && $scope.p.fixMode <= ptns) playPtnIdx = $scope.p.fixMode - 1;
      else playPtnIdx = 0;
    } else {
      var f = 4;   // デフォルト : 1/4の確率でパターン再選択
      if ($scope.p.chgPtnFreq > 1) f = $scope.p.chgPtnFreq - 1;
      if (!Utils.getRandomInt(0, f)) playPtnIdx = Utils.getRandomInt(0, ptns - 1);
    }

    function play1() {
      if (ptnArr[playPtnIdx]['rest'][playIdx]) return;  // 休符
      var ctr = 0;
      var noteNum;
      for (key in notes) {
        var de1 = ptnArr[playPtnIdx]['deg'][playIdx] + ptnArr[playPtnIdx]['degSft'];  // [イメージ] -1 や 0 や 1 や 7。degSftはdegreeShift
        var deg = ((de1 % sOfSc) + sOfSc) % sOfSc;  // [イメージ] 0～6
        var octOfs = ptnArr[playPtnIdx]['oct'][playIdx] + Math.floor(de1 / sOfSc); // [イメージ] -1 や 0 や 1
        if (ctr == deg) {
          // MIDI INから入力された7つのノートのうち、ランダムパターンで選んだ度数の音のみノートオンする
          noteNum = parseInt(key) + octOfs * 12;
          midi.outputs[outputSelIdx].send([0x90, noteNum, notes[key]]);
          midi.outputs[outputSelIdx].send([0x80, noteNum, notes[key]], window.performance.now() + stepTimeMsec);
          return;
        }
        ctr++;
      }
    }
    function countSOfSc() {  // size of scale
      var ctr = 0;
      for (key in notes) ctr++;
      return ctr;
    }
  }

  var beatnote = 16; // 16分音符以外で使うことはなさそうなので$scope.pには入れない。$scope.pには画面と相互バインディングしたいものだけ入れる
  var stepTimeMsec = calcStepTimeMsec($scope.p.bpm, beatnote);
  setSeqInterval();
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
    alert(playIdx);
    playIdx = 0;
    alert(playIdx);
  }

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
