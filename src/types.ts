import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {
  LayoutComponent,
  Layout,
  Options,
  LayoutRoot,
} from 'react-native-navigation';
import {Driver} from '@cycle/run';
import {Frame, GlobalScreen} from './symbols';
import {NavSource} from './NavSource';

export interface PushCommand {
  type: 'push';
  id?: string;
  layout: Layout;
};

export interface PopCommand {
  type: 'pop';
  id?: string;
  options: Options;
};

export interface PopToCommand {
  type: 'popTo';
  id?: string;
};

export interface PopToRootCommand {
  type: 'popToRoot';
  id?: string;
};

export interface SetStackRootCommand {
  type: 'setStackRoot';
  id?: string;
  layout: Layout;
};

export interface ShowOverlayCommand {
  type: 'showOverlay';
  id?: string;
  layout: Layout;
};

export interface DismissOverlayCommand {
  type: 'dismissOverlay';
  id?: string;
};

export interface ShowModalCommand {
  type: 'showModal';
  id?: string;
  layout: Layout;
};

export interface SetRootCommand {
  type: 'setRoot';
  layout: LayoutRoot;
};

export interface DismissModalCommand {
  type: 'dismissModal';
  id?: string;
};

export interface DismissAllModalsCommand {
  type: 'dismissAllModals';
  id?: string;
};

export interface MergeOptionsCommand {
  type: 'mergeOptions';
  id?: string;
  opts: Options;
};

export type Command =
  | PushCommand
  | PopCommand
  | PopToCommand
  | PopToRootCommand
  | SetRootCommand
  | SetStackRootCommand
  | ShowOverlayCommand
  | DismissOverlayCommand
  | ShowModalCommand
  | DismissModalCommand
  | DismissAllModalsCommand
  | MergeOptionsCommand;

export interface MainDrivers {
  screen: Driver<Stream<any>, any | void>;
  // navigation: Driver<Stream<any>, any | void>;
  [name: string]: Driver<Stream<any>, any | void>;
}

export interface MainSources {
  navigationStack: StateSource<Stack>;
  screen: ReactSource;
}

export interface ScreenSources {
  navigation?: NavSource;
  screen: ReactSource;
}

export interface ScreenSinks {
  navigation?: Stream<Command>;
  screen: Stream<ReactElement<any>>;
}

export interface ListSinks {
  navigation?: Stream<Command>;
  screen: Stream<Array<ReactElement<any>>>;
}

export interface FrameSources extends MainSources {
  navigation?: NavSource;
  children: Stream<Array<ReactElement>>;
}

export interface MainSinks {
  navigationStack: Stream<Reducer<Stack>>;
  screen: Stream<ReactElement<any>>;
}

export type Stack = Array<LayoutComponent>;

export interface Screens {
  [screenId: string]: (so: any) => any;
  [GlobalScreen]?: (so: any) => any;
  [Frame]?: (so: any) => any;
}
