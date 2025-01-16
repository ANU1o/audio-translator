# Audio Translator

Create `.env` file in root directory and enter the following

```
ELEVENLABS_API_KEY=<APIKEY HERE>
```

To test the translator run

```sh
npm run test
```

Call `createDubFromFile()` function to use the dubbing feature in project. It is located at [`index.js`](./src/index.js) in `src` folder.

Refer [`test.js`](./src/test/test.js) for example usecase.

## ElevenLab Supported Language List

| No  | Language Name | Language Code |
| :-: | :------------ | :-----------: |
|  1  | English       |      en       |
|  2  | Hindi         |      hi       |
|  3  | Portuguese    |      pt       |
|  4  | Chinese       |      zh       |
|  5  | Spanish       |      es       |
|  6  | French        |      fr       |
|  7  | German        |      de       |
|  8  | Japanese      |      ja       |
|  9  | Arabic        |      ar       |
| 10  | Russian       |      ru       |
| 11  | Korean        |      ko       |
| 12  | Indonesian    |      id       |
| 13  | Italian       |      it       |
| 14  | Dutch         |      nl       |
| 15  | Turkish       |      tr       |
| 16  | Polish        |      pl       |
| 17  | Swedish       |      sv       |
| 18  | Filipino      |      fil      |
| 19  | Malay         |      ms       |
| 20  | Romanian      |      ro       |
| 21  | Ukrainian     |      uk       |
| 22  | Greek         |      el       |
| 23  | Czech         |      cs       |
| 24  | Danish        |      da       |
| 25  | Finnish       |      fi       |
| 26  | Bulgarian     |      bg       |
| 27  | Croatian      |      hr       |
| 28  | Slovak        |      sk       |
| 29  | Tamil         |      ta       |
