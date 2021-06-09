import xs, {Stream} from 'xstream';
import concat from 'xstream/extra/concat';
import dropRepeats from 'xstream/extra/dropRepeats';
import {makeReactNativeDriver} from '@cycle/react-native';
import {Drivers, setupReusable} from '@cycle/run';
import {createElement as $, ReactElement} from 'react';
import isolate from '@cycle/isolate';
import {View, StyleSheet, AppRegistry} from 'react-native';
import {Layout, LayoutComponent} from 'react-native-navigation';
import {makeCollection, withState, Lens, Reducer} from '@cycle/state';
import {
  Command,
  FrameSources,
  Stack,
  MainDrivers,
  MainSinks,
  MainSources,
  ScreenSinks,
  ScreenSources,
  ListSinks,
  Screens,
} from './types';
import {Frame, GlobalScreen} from './symbols';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
  },

  shown: {
    height: '100%',
  },

  hidden: {
    display: 'none',
  },
});

function logAndThrow(err: string): never {
  console.error(err);
  throw new Error(err);
}

function neverComplete<T>(stream: Stream<T>): Stream<T> {
  return xs.merge(stream, xs.never());
}

export function run(screens: Screens, drivers: Drivers, initialLayout: Layout) {
  let _i = 1;
  function newID(label?: string) {
    return `${label ?? ''}${_i++}`;
  }

  function instantiateLayout(layout: LayoutComponent) {
    return {...layout, id: newID(layout.name as string)};
  }

  const APP_KEY = 'cyclenativenavigationelectron';

  const driversPlus: MainDrivers = {
    ...drivers,
    ...({
      screen: makeReactNativeDriver(APP_KEY),
      // FIXME: creating NavSource will be a big deal, full of details
      navigation: (x) => ({
        backPress: () => xs.never(),
        globalDidDisappear: () => xs.never(),
        globalDidAppear: () => xs.never(),
      }),
    } as MainDrivers),
  };

  function main(sources: MainSources): MainSinks {
    const frameEnabled$ = sources.navigationStack.stream
      .map((stack) => {
        if (stack.length <= 1) return true;
        const top = stack[stack.length - 1];
        if (!top.options) return true;
        if (!top.options.sideMenu) return true;
        if (!top.options.sideMenu.left) return true;
        return top.options.sideMenu.left.enabled !== false;
      })
      .compose(dropRepeats());

    const List: (so: ScreenSources) => ListSinks = makeCollection({
      channel: 'navigationStack',
      itemFactory: (childState: LayoutComponent) => {
        const component = screens[childState.name];
        if (!component) {
          logAndThrow('no component for ' + childState.name);
        }
        return function wrapComponent(sources: ScreenSources) {
          const innerSources = {
            ...sources,
            props: xs
              .of(childState.passProps)
              .compose(neverComplete)
              .remember(),
          };
          return component(innerSources);
        };
      },
      itemKey: (childState: LayoutComponent) => childState.id!,
      itemScope: (key) => key,
      collectSinks: (instances) => {
        const sinks = {} as any;
        for (const channel of Object.keys(driversPlus)) {
          if (channel === 'screen') {
            sinks[channel] = instances.pickCombine(channel).map((itemVNodes) =>
              itemVNodes.map((vnode, i) => {
                if (i === itemVNodes.length - 1) {
                  return $(View, {key: 'c' + i, style: styles.shown}, vnode);
                  // return h(View, {key: 'c' + i, style: styles.shown}, [vnode]);
                } else {
                  return $(View, {key: 'c' + i, style: styles.hidden}, vnode);
                }
              }),
            );
          } else {
            sinks[channel] = instances.pickMerge(channel);
          }
        }
        return sinks;
      },
    });

    const listSinks = List(sources);

    const unframedVDOM$ = listSinks.screen.map(
      (children) =>
        $(View, {style: styles.container}, ...children) as ReactElement,
    );

    const identityLens: Lens<any, any> = {
      get: (x) => x,
      set: (_, x) => x,
    };

    const frameSources: FrameSources = {
      ...sources,
      children: listSinks.screen,
    };
    const frameSinks: Partial<ScreenSinks> = screens[Frame]
      ? (isolate(screens[Frame]!, {
          '*': 'frame',
          navigationStack: identityLens,
        })(frameSources) as ScreenSinks)
      : {};

    const vdom$ = screens[Frame]
      ? xs
          .combine(frameEnabled$, frameSinks.screen!, unframedVDOM$)
          .map(([frameEnabled, framedVDOM, unframedVDOM]) =>
            frameEnabled ? framedVDOM : unframedVDOM,
          )
      : unframedVDOM$;

    const stackReducer$ = concat(
      xs.of<Reducer<Stack>>((_prev) => {
        const initialComponent = initialLayout.stack?.children?.[0].component;
        if (!initialComponent) {
          logAndThrow('initialLayout only supports stack.children[0]');
        }
        return [instantiateLayout(initialComponent)];
      }),

      xs
        .merge(listSinks.navigation!, frameSinks.navigation ?? xs.never())
        .map((cmd: Command) => (prevStack) => {
          if (cmd.type === 'push') {
            return [...prevStack!, instantiateLayout(cmd.layout.component!)];
          }

          if (cmd.type === 'setStackRoot') {
            const component =
              cmd.layout.sideMenu?.center.stack?.children?.[0].component;
            if (!component) {
              logAndThrow('setStackRoot only supported for sideMenu center');
            }
            return [instantiateLayout(component)];
          }

          if (cmd.type === 'pop') {
            if (prevStack!.length === 1) return prevStack;
            prevStack!.pop();
            return [...prevStack!];
          }

          console.warn('unknown nav command', cmd);
          return prevStack;
        }),
    );

    return {
      ...listSinks,
      screen: vdom$,
      navigationStack: stackReducer$,
    };
  }

  const engine = setupReusable(driversPlus);

  if (screens[GlobalScreen]) {
    engine.run(withState(screens[GlobalScreen]!)(engine.sources));
  }
  engine.run(withState(main, 'navigationStack')(engine.sources));

  AppRegistry.runApplication(APP_KEY, {
    rootTag: document.getElementById('app'),
  });
}
