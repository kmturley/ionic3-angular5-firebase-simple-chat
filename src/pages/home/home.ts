import { Component, ViewChild, NgZone } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import { RoomPage } from '../room/room';
import * as firebase from 'Firebase';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild(Content) content: Content;

  data = { type: '', nickname: '', message: '' };
  chats = [];
  roomkey: string;
  nickname: string;
  offStatus: boolean = false;

  dialects: Array<object>;
  languages: Array<object>;
  voices: Array<object>;

  langs = [
    ['Afrikaans', ['af-ZA']],
    ['አማርኛ', ['am-ET']],
    ['Azərbaycanca', ['az-AZ']],
    ['বাংলা', ['bn-BD', 'বাংলাদেশ'],
      ['bn-IN', 'ভারত']],
    ['Bahasa Indonesia', ['id-ID']],
    ['Bahasa Melayu', ['ms-MY']],
    ['Català', ['ca-ES']],
    ['Čeština', ['cs-CZ']],
    ['Dansk', ['da-DK']],
    ['Deutsch', ['de-DE']],
    ['English', ['en-AU', 'Australia'],
      ['en-CA', 'Canada'],
      ['en-IN', 'India'],
      ['en-KE', 'Kenya'],
      ['en-TZ', 'Tanzania'],
      ['en-GH', 'Ghana'],
      ['en-NZ', 'New Zealand'],
      ['en-NG', 'Nigeria'],
      ['en-ZA', 'South Africa'],
      ['en-PH', 'Philippines'],
      ['en-GB', 'United Kingdom'],
      ['en-US', 'United States']],
    ['Español', ['es-AR', 'Argentina'],
      ['es-BO', 'Bolivia'],
      ['es-CL', 'Chile'],
      ['es-CO', 'Colombia'],
      ['es-CR', 'Costa Rica'],
      ['es-EC', 'Ecuador'],
      ['es-SV', 'El Salvador'],
      ['es-ES', 'España'],
      ['es-US', 'Estados Unidos'],
      ['es-GT', 'Guatemala'],
      ['es-HN', 'Honduras'],
      ['es-MX', 'México'],
      ['es-NI', 'Nicaragua'],
      ['es-PA', 'Panamá'],
      ['es-PY', 'Paraguay'],
      ['es-PE', 'Perú'],
      ['es-PR', 'Puerto Rico'],
      ['es-DO', 'República Dominicana'],
      ['es-UY', 'Uruguay'],
      ['es-VE', 'Venezuela']],
    ['Euskara', ['eu-ES']],
    ['Filipino', ['fil-PH']],
    ['Français', ['fr-FR']],
    ['Basa Jawa', ['jv-ID']],
    ['Galego', ['gl-ES']],
    ['ગુજરાતી', ['gu-IN']],
    ['Hrvatski', ['hr-HR']],
    ['IsiZulu', ['zu-ZA']],
    ['Íslenska', ['is-IS']],
    ['Italiano', ['it-IT', 'Italia'],
      ['it-CH', 'Svizzera']],
    ['ಕನ್ನಡ', ['kn-IN']],
    ['ភាសាខ្មែរ', ['km-KH']],
    ['Latviešu', ['lv-LV']],
    ['Lietuvių', ['lt-LT']],
    ['മലയാളം', ['ml-IN']],
    ['मराठी', ['mr-IN']],
    ['Magyar', ['hu-HU']],
    ['ລາວ', ['lo-LA']],
    ['Nederlands', ['nl-NL']],
    ['नेपाली भाषा', ['ne-NP']],
    ['Norsk bokmål', ['nb-NO']],
    ['Polski', ['pl-PL']],
    ['Português', ['pt-BR', 'Brasil'],
      ['pt-PT', 'Portugal']],
    ['Română', ['ro-RO']],
    ['සිංහල', ['si-LK']],
    ['Slovenščina', ['sl-SI']],
    ['Basa Sunda', ['su-ID']],
    ['Slovenčina', ['sk-SK']],
    ['Suomi', ['fi-FI']],
    ['Svenska', ['sv-SE']],
    ['Kiswahili', ['sw-TZ', 'Tanzania'],
      ['sw-KE', 'Kenya']],
    ['ქართული', ['ka-GE']],
    ['Հայերեն', ['hy-AM']],
    ['தமிழ்', ['ta-IN', 'இந்தியா'],
      ['ta-SG', 'சிங்கப்பூர்'],
      ['ta-LK', 'இலங்கை'],
      ['ta-MY', 'மலேசியா']],
    ['తెలుగు', ['te-IN']],
    ['Tiếng Việt', ['vi-VN']],
    ['Türkçe', ['tr-TR']],
    ['اُردُو', ['ur-PK', 'پاکستان'],
      ['ur-IN', 'بھارت']],
    ['Ελληνικά', ['el-GR']],
    ['български', ['bg-BG']],
    ['Pусский', ['ru-RU']],
    ['Српски', ['sr-RS']],
    ['Українська', ['uk-UA']],
    ['한국어', ['ko-KR']],
    ['中文', ['cmn-Hans-CN', '普通话 (中国大陆)'],
      ['cmn-Hans-HK', '普通话 (香港)'],
      ['cmn-Hant-TW', '中文 (台灣)'],
      ['yue-Hant-HK', '粵語 (香港)']],
    ['日本語', ['ja-JP']],
    ['हिन्दी', ['hi-IN']],
    ['ภาษาไทย', ['th-TH']]
  ];

  ignore_onend = false;
  recognition = new window["webkitSpeechRecognition"]();
  recognizing = false;
  synth = window.speechSynthesis;
  voicesList: Array<object>;
  start_timestamp = 0;
  messages = {
    final_transcript: 'none',
    final_span: '',
    interim_span: 'none',
    final_voice: '',
    interim_voice: 'none'
  };
  selectLanguage = this.langs[10][0]; // en
  selectDialect = this.langs[10][11][0]; // US
  selectVoice = 'en-US';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private zone: NgZone
  ) {
    this.roomkey = this.navParams.get("key") as string;
    this.nickname = this.navParams.get("nickname") as string;
    this.data.type = 'message';
    this.data.nickname = this.nickname;

    let joinData = firebase.database().ref('chatrooms/' + this.roomkey + '/chats').push();
    joinData.set({
      type: 'join',
      user: this.nickname,
      message: this.nickname + ' has joined this room.',
      sendDate: Date()
    });
    this.data.message = '';

    firebase.database().ref('chatrooms/' + this.roomkey + '/chats').on('value', resp => {
      this.chats = [];
      this.chats = snapshotToArray(resp);
      console.log('chats', this.chats);
      setTimeout(() => {
        if (this.offStatus === false) {
          this.content.scrollToBottom(300);
        }
      }, 1000);
    });

    firebase.database().ref('chatrooms/' + this.roomkey + '/chats').on('child_added', (snapshot, prevChildKey) => {
      if (prevChildKey === this.chats[this.chats.length - 1].key) {
        var newItem = snapshot.val();
        console.log('newItem', newItem);
        var langOutput = this.selectVoice.split('-')[0];
        if (langOutput === 'en') {
          this.speak(newItem.message);
        } else {
          this.translate('en', langOutput, newItem.message, (translation) => {
            this.zone.run(() => {
              console.log('translation', translation);
              this.speak(translation);
            });
          });
        }
      }
    });

    this.updateLanguages();
    this.updateDialects();
    this.updateVoices();
    if (window['speechSynthesis'].onvoiceschanged !== undefined) {
      window['speechSynthesis'].onvoiceschanged = () => {
        this.updateVoices();
      }
    }
    this.setup();
  }

  sendMessage() {
    let newData = firebase.database().ref('chatrooms/' + this.roomkey + '/chats').push();
    newData.set({
      type: this.data.type,
      user: this.data.nickname,
      message: this.data.message,
      sendDate: Date()
    });
    this.data.message = '';
  }

  exitChat() {
    let exitData = firebase.database().ref('chatrooms/' + this.roomkey + '/chats').push();
    exitData.set({
      type: 'exit',
      user: this.nickname,
      message: this.nickname + ' has exited this room.',
      sendDate: Date()
    });

    this.offStatus = true;

    this.navCtrl.setRoot(RoomPage, {
      nickname: this.nickname
    });
  }

  setup() {
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.onstart = () => {
      this.zone.run(() => {
        this.recognizing = true;
        this.showInfo('info_speak_now');
      });
    }

    this.recognition.onerror = (event) => {
      this.zone.run(() => {
        if (event.error == 'no-speech') {
          this.showInfo('info_no_speech');
          this.ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
          this.showInfo('info_no_microphone');
          this.ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
          if (event.timeStamp - this.start_timestamp < 100) {
            this.showInfo('info_blocked');
          } else {
            this.showInfo('info_denied');
          }
          this.ignore_onend = true;
        }
      });
    }

    this.recognition.onend = () => {
      this.zone.run(() => {
        this.recognizing = false;
        if (this.ignore_onend) {
          return;
        }
        if (!this.messages.final_transcript) {
          this.showInfo('info_start');
          return;
        }
        this.showInfo('');
        // if (window.getSelection) {
        //   window.getSelection().removeAllRanges();
        //   var range = document.createRange();
        //   range.selectNode(document.getElementById('final_span'));
        //   window.getSelection().addRange(range);
        // }
      });
    }

    this.recognition.onresult = (event) => {
      this.zone.run(() => {
        let interim_transcript = '';
        if (typeof (event.results) == 'undefined') {
          this.recognition.onend = null;
          this.recognition.stop();
          return;
        }
        for (var i = event.resultIndex; i < event.results.length; ++i) {
          const message = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this.messages.final_transcript += message;
            var langInput = this.selectDialect.split('-')[0];
            if (langInput === 'en') {
              this.messages.final_voice += ' ' + message;
              this.data.message = message;
            } else {
              this.translate(langInput, 'en', message, (translation) => {
                this.zone.run(() => {
                  this.messages.final_voice += ' ' + translation;
                  console.log('translate.success', this.messages.final_voice);
                  this.data.message = translation;
                });
              });
            }
          } else {
            interim_transcript += message;
          }
        }
        this.messages.final_transcript = this.capitalize(this.messages.final_transcript);
        this.messages.final_span = this.linebreak(this.messages.final_transcript);
        this.messages.interim_span = this.linebreak(interim_transcript);
        console.log('onresult', this.messages.final_span, this.messages.interim_span);
      });
    }
  }

  updateLanguages() {
    this.languages = [];
    for (var i = 0; i < this.langs.length; i++) {
      this.languages.push({
        label: this.langs[i][0],
        value: this.langs[i][0]
      });
    }
    console.log('updateLanguages', this.languages);
  }

  updateDialects(event?) {
    this.dialects = [];
    const index = event ? event.target.selectedIndex : 10;
    var list = this.langs[index];
    for (var j = 1; j < list.length; j++) {
      this.dialects.push({
        label: list[j][1] || list[0],
        value: list[j][0]
      });
    }
    if (index === 10) { // en
      this.selectDialect = this.dialects[11]['value'];
    } else {
      this.selectDialect = this.dialects[0]['value'];
    }
    console.log('updateDialects', index, this.dialects, this.selectDialect);
  }

  updateVoices() {
    this.voicesList = this.synth.getVoices();
    this.voicesList.sort((a, b) => {
      var nameA = a['lang'].toUpperCase();
      var nameB = b['lang'].toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    this.voices = [];
    for (var i = 0; i < this.voicesList.length; i++) {
      this.voices.push({
        label: `${this.voicesList[i]['lang']} (${this.voicesList[i]['name']})`,
        value: this.voicesList[i]['lang']
      });
    }
    console.log('updateVoices', this.voices);
  }

  start(event) {
    if (this.recognizing) {
      this.recognition.stop();
      return;
    }
    this.recognition.lang = this.selectDialect;
    console.log('recognition.lang', this.recognition.lang);
    this.recognition.start();
    this.ignore_onend = false;
    this.messages.final_transcript = '';
    this.messages.final_span = '';
    this.messages.interim_span = '';
    this.messages.final_voice = '';
    this.messages.interim_voice = '';
    this.showInfo('info_allow');
  }

  translate(langInput: string, langOutput: string, text: string, callback: Function) {
    console.log('translate', langInput, langOutput, text);
    this.load(`https://translation.googleapis.com/language/translate/v2/?q=${window['encodeURI'](text)}&source=${langInput}&target=${langOutput}&key=AIzaSyAc6SD0Ou6Z9yv20FexNrlU2ql568He89I`, (response) => {
      callback(response.data.translations[0].translatedText);
    });
  }

  load(url: string, callback: Function) {
    console.log('load', url);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        callback(JSON.parse(xmlHttp.responseText));
      }
    }
    xmlHttp.open('GET', url, true);
    xmlHttp.send(null);
  }

  speak(text: string) {
    console.log('speak', text);
    var utterThis = new SpeechSynthesisUtterance(text);
    this.voicesList.forEach((voiceItem) => {
      if (voiceItem['lang'] === this.selectVoice) {
        utterThis.voice = voiceItem as SpeechSynthesisVoice;
      }
    });
    utterThis.pitch = 1;
    utterThis.rate = 1;
    this.synth.speak(utterThis);
    utterThis.onpause = (event) => {
      this.zone.run(() => {
        var char = event.utterance.text.charAt(event.charIndex);
        console.log('Speech paused at character ' + event.charIndex + ' of "' +
          event.utterance.text + '", which is "' + char + '".');
      });
    }
  }

  showInfo(message: string) {
    console.log('showInfo', message);
  }

  capitalize(s: string) {
    var first_char = /\S/;
    return s.replace(first_char, (m) => { return m.toUpperCase(); });
  }

  linebreak(s: string) {
    var two_line = /\n\n/g;
    var one_line = /\n/g;
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
  }
}

export const snapshotToArray = snapshot => {
  let returnArr = [];

  snapshot.forEach(childSnapshot => {
    let item = childSnapshot.val();
    item.key = childSnapshot.key;
    returnArr.push(item);
  });

  return returnArr;
};
