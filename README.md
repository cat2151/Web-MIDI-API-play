# Web-MIDI-API-play
Web MIDI APIで小物を作って遊んでみる

# DEMOS
* [前提] 以下のどれかが用意してあること
 * PCに、USBケーブルでMIDI楽器を接続している
 * PCに、USB-MIDI ケーブル経由で、MIDI楽器を接続している
 * [PC内で、loopMIDIなど仮想MIDIポートに、DAWなどを接続している](https://github.com/tanikawa04/webmidiapi_to_daw_sample/blob/master/virtual_midi_port.md)

* [DEMO 1 : Web MIDI API対応ブラウザかチェック + MIDI楽器リスト表示](http://cat2151.github.io/Web-MIDI-API-play/index01.html)

* [DEMO 2 : MIDI INモニタリング + MIDI OUTへTHRU](http://cat2151.github.io/Web-MIDI-API-play/index02.html)
 * MIDI OUTにMIDI楽器やDAWが接続されていれば、音が確認できます。以降も同様

* [DEMO 3 : MIDI OUTにNOTE ONとNOTE OFFを送信](http://cat2151.github.io/Web-MIDI-API-play/index03.html)

* [DEMO A-1 : 簡易ランダムアルペエータ](http://cat2151.github.io/Web-MIDI-API-play/randomArpeggiator01.html)  
 * [利用方法](http://qiita.com/cat2151/items/507bdb4d78e4ae369d02)

* [DEMO M-1 : 簡易ランダムシーケンス生成器](http://cat2151.github.io/Web-MIDI-API-play/monoSeqGen02/index.html)  
 * 利用方法 : ランダムアルペエータと同様。ただし1音を鳴らすだけで利用可。
 * [旧バージョン](http://cat2151.github.io/Web-MIDI-API-play/monoSeqGen01.html)

# [注意]
* [Chrome]  
Chromeでのみ動作確認しています。  
FirefoxとIEは、Web MIDI APIの実装が遅れているため動きません  
（そのうち実装されると思っています）。  

* [ローカル]  
（この注意書きは今は無意味ですが、今後のための備忘です。  
今はローカルのindex.htmlを単純に実行しても問題ありません）  
Polymerを使ったものをローカルで実行する場合は、Chrome Dev Editorでのみ動作確認しています。  
ローカルにindex.htmlを置いてそれを単純にChromeで実行しても、動かない場合があります。  
