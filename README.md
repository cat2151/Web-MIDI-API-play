# Web-MIDI-API-play
Web MIDI APIで小物を作って遊んでみる

# DEMOS
* [前提]
以下のどれかが用意してあること
 * PCに、USBケーブルでMIDI楽器を接続している
 * PCに、USB-MIDI ケーブルを接続している
 * loopMIDIで仮想MIDIデバイスを用意してある

* [DEMO 1 : Web MIDI API対応ブラウザかチェック + MIDI楽器リスト表示](http://cat2151.github.io/Web-MIDI-API-play/index01.html)

* [DEMO 2 : MIDI INモニタリング + MIDI OUTへTHRU](http://cat2151.github.io/Web-MIDI-API-play/index02.html)

# [注意]
* [Chrome]
Chromeでのみ動作確認しています。  
FirefoxとIEは、Web MIDI APIの実装が遅れているため動きません  
（そのうち実装されると思っています）。  

* [ローカル]
ローカルで実行する場合は、Chrome Dev Editorでのみ動作確認しています。  
ローカルにindex.htmlを置いてそれを単純にChromeで実行しても、動かない場合があります。  
