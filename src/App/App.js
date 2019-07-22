import React from "react";
import { Router, Route, Switch } from "react-router-dom";

import { history } from "../helpers/history.js";
import { ChartScreen } from "../screens/ChartScreen.js";
import { SearchScreen } from "../screens/SearchScreen";
import { PageNotFound } from "../helpers/PageNotFound.js";

class App extends React.Component {
  render() {
    history.push("/chart");
    return (
      <div>
        <Router history={history}>
          <Switch>
            <Route path="/chart" component={ChartScreen} />
            <Route path="/search" component={SearchScreen} />
            <Route component={PageNotFound} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export { App };
