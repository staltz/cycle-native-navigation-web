# Cycle Native Navigation Web

Similar to and largely compatible with [cycle-native-navigation](https://github.com/staltz/cycle-native-navigation) but meant for use with `react-native-web` and Electron.

```
npm install cycle-native-navigation-web
```

Note: `react-native-navigation`, `react-native`, `react-native-web`, `react` are expected peer dependencies.

**Usage:**

```js
import {run} from 'cycle-native-navigation-web';

const screens = {
  MainScreen: function main(sources) {
    /* Your Cycle.js component here... */
  },
  ListScreen: function list(sources) {
    /* ... */
  },
  HelpScreen: function help(sources) {
    /* ... */
  },
};

const drivers = {
  // Typical Cycle.js drivers object that is given to run()
};

const layout = {
  // The initial app layout, see react-native-navigation docs about this
};

run(screens, drivers, layout);
```

To support `navSource.backPress()`, monitor the browser `history` or the Electron navigation state, and emit the event `cyclenativenavigationweb-back` on the `window`.
