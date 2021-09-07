import React from "react";
import { Drizzle } from '@drizzle/store';
import { drizzleReactHooks } from "@drizzle/react-plugin";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import drizzleOptions from "./drizzleOptions";
import LoadingContainer from './LoadingContainer.js';
import Navbar from './Navbar.js';
import AllTweets from './AllTweets.js';
import MyTweets from "./MyTweets";
import NewTweet from "./NewTweet";
import sendMessage from "./sendMessage";

console.log(drizzleOptions);
const drizzle = new Drizzle(drizzleOptions);
console.log(drizzle);
const { DrizzleProvider } = drizzleReactHooks;

function App() {
  return (
    <div>
    <Router>
      <DrizzleProvider drizzle={drizzle}>
        <LoadingContainer>
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <Navbar />
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12">
                <Switch>
                  <Route exact path="/" component={AllTweets} />
                  <Route exact path="/my-tweets" component={MyTweets} />
                  <Route exact path="/new-tweet" component={NewTweet} />
                  <Route exact path="/send-message" component={sendMessage} />
                </Switch>
              </div>
            </div>
          </div>
        </LoadingContainer>
      </DrizzleProvider>
    </Router>
    </div>
  );
}

export default App;
