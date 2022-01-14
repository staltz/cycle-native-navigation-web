import xs, {Stream, MemoryStream} from 'xstream';
import {
  ComponentDidAppearEvent,
  ComponentDidDisappearEvent,
} from 'react-native-navigation';

export class NavSource {
  // public readonly _topBar: Stream<string>;
  // public readonly _back: Stream<null>;
  public readonly _didAppear: MemoryStream<null>;
  public readonly _didDisappear: MemoryStream<null>;
  public readonly _globalDidAppear: Stream<ComponentDidAppearEvent>;
  public readonly _globalDidDisappear: Stream<ComponentDidDisappearEvent>;
  public readonly _globalBack: Stream<unknown>;
  public _isTop: boolean;

  constructor(
    globalDidAppear: Stream<ComponentDidAppearEvent>,
    globalDidDisappear: Stream<ComponentDidDisappearEvent>,
    globalBack: Stream<unknown>,
  ) {
    // this._topBar = xs.create<string>();
    // this._back = xs.create<null>();
    this._didAppear = xs.createWithMemory<null>();
    this._didDisappear = xs.createWithMemory<null>();
    this._globalDidAppear = globalDidAppear;
    this._globalDidDisappear = globalDidDisappear;
    this._globalBack = globalBack;
    this._isTop = true;
  }

  // TODO:
  // public topBarButtonPress(buttonId?: string) {
  //   if (buttonId) return this._topBar.filter((id) => id === buttonId);
  //   else return this._topBar;
  // }

  public backPress() {
    return this._globalBack.filter(() => this._isTop);
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
