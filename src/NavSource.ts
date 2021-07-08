import xs, {Stream} from 'xstream';
import {
  ComponentDidAppearEvent,
  ComponentDidDisappearEvent,
} from 'react-native-navigation';

export class NavSource {
  // public readonly _topBar: Stream<string>;
  // public readonly _back: Stream<null>;
  public readonly _didAppear: Stream<null>;
  public readonly _didDisappear: Stream<null>;
  public readonly _globalDidAppear: Stream<ComponentDidAppearEvent>;
  public readonly _globalDidDisappear: Stream<ComponentDidDisappearEvent>;

  constructor(
    globalDidAppear: Stream<ComponentDidAppearEvent>,
    globalDidDisappear: Stream<ComponentDidDisappearEvent>,
  ) {
    // this._topBar = xs.create<string>();
    // this._back = xs.create<null>();
    this._didAppear = xs.create<null>();
    this._didDisappear = xs.create<null>();
    this._globalDidAppear = globalDidAppear;
    this._globalDidDisappear = globalDidDisappear;
  }

  // TODO:
  // public topBarButtonPress(buttonId?: string) {
  //   if (buttonId) return this._topBar.filter((id) => id === buttonId);
  //   else return this._topBar;
  // }

  public backPress() {
    return xs.never(); // TODO: this._back;
  }

  public didAppear() {
    return this._didAppear;
  }

  public didDisappear() {
    return this._didDisappear;
  }

  public globalDidAppear(
    componentName?: string,
  ): Stream<ComponentDidAppearEvent> {
    if (componentName) {
      return this._globalDidAppear.filter(
        (ev) => ev.componentName === componentName,
      );
    } else {
      return this._globalDidAppear;
    }
  }

  public globalDidDisappear(
    componentName?: string,
  ): Stream<ComponentDidDisappearEvent> {
    if (componentName) {
      return this._globalDidDisappear.filter(
        (ev) => ev.componentName === componentName,
      );
    } else {
      return this._globalDidDisappear;
    }
  }
}
