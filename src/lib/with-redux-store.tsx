import React, { Component, ComponentType } from "react";
import { Store } from "@reduxjs/toolkit";
import { getOrCreateStore, AppStore, AppState } from "../redux/store";

export interface WithReduxProps {
  reduxStore: AppStore;
  initialReduxState?: AppState;
}

export default function withReduxStore<P extends object>(
  App: ComponentType<P & WithReduxProps>
) {
  return class AppWithRedux extends Component<Omit<P, "reduxStore"> & { initialReduxState?: AppState }> {
    private reduxStore: AppStore;

    static async getInitialProps(appContext: { ctx: { reduxStore?: Store } }) {
      const reduxStore = getOrCreateStore();
      appContext.ctx.reduxStore = reduxStore;
      let appProps = {};

      const appAny = App as unknown as {
        getInitialProps?: (ctx: typeof appContext) => Promise<any>;
      };

      if (typeof appAny.getInitialProps === "function") {
        appProps = await appAny.getInitialProps(appContext);
      }

      return { ...appProps, initialReduxState: reduxStore.getState() };
    }

    constructor(props: Omit<P, "reduxStore"> & { initialReduxState?: AppState }) {
      super(props);
      this.reduxStore = getOrCreateStore(props.initialReduxState as Parameters<typeof getOrCreateStore>[0]);
    }

    render() {
      return <App {...(this.props as P & WithReduxProps)} reduxStore={this.reduxStore} />;
    }
  };
}
