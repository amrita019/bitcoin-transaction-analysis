import React from "react";
import "../App/App.css";
import Websocket from "react-websocket";
import { Message, Loader } from "semantic-ui-react";
import {
  VictoryLine,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryLabel
} from "victory";
import { Link } from "react-router-dom";

class ChartScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "Connecting",
      globalData: [],
      graphData: []
    };
  }

  handleData(data) {
    //Receive new transaction data
    const result = JSON.parse(data);
    if (typeof result.x != "undefined") {
      result.x.out.map(item => {
        if (item.value / Math.pow(10, 8) > 1) {
          const amountUSD = this.convertBTCtoUSD(
            item.value / Math.pow(10, 8)
          ).then(amountUSD => {
            const timestamp = new Date().toLocaleTimeString({
              second: "2-digit"
            });
            var globalDataItem = {
              timestamp: timestamp,
              amountBTC: item.value / Math.pow(10, 8),
              amountUSD: amountUSD,
              transactionHash: result.x.hash
            };
            this.state.globalData.push(globalDataItem);
          });
        }
      });
    }

    if (this.state.globalData) {
      var tempGraphData = [];
      this.state.globalData.map(item => {
        var i = { x: item.timestamp, y: item.amountBTC };
        tempGraphData.push(i);
      });
      this.state.graphData = tempGraphData.slice(
        Math.max(this.state.globalData.length - 10, 0)
      );
      console.log(this.state.graphData);
    }

    localStorage.setItem("globalData", JSON.stringify(this.state.globalData));

    let p = this.state;
    this.setState({
      state: p
    });
  }

  async convertBTCtoUSD(amountInBTC) {
    //Convert BTC to USD
    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    };

    var amountUSD;
    await fetch("https://blockchain.info/ticker", requestOptions)
      .then(this.handleResponse)
      .then(res => {
        var exchangeRate = parseInt(res["USD"]["last"]);
        amountUSD = amountInBTC * exchangeRate;
      });
    return amountUSD;
  }

  handleResponse(response) {
    //Handle response from request
    return response.text().then(text => {
      const data = text && JSON.parse(text);
      if (!response.ok) {
        if (response.status === 401) {
          // error
        }
        const error = (data && data.message) || response.message;
        return Promise.reject(error);
      }
      return data;
    });
  }

  handleOpen() {
    //Socket Open
    this.setState({ status: "Connected" });
    this.subscribeToUnconfirmedTransactions();
  }

  handleClose() {
    //Socket Close
    this.setState({ status: "Disconnected" });
  }

  subscribeToUnconfirmedTransactions() {
    //Subscribe to unconfirmed transactions
    const message = { op: "unconfirmed_sub" };
    this.refWebSocket.sendMessage(JSON.stringify(message));
  }

  render() {
    const { status, graphData } = this.state;
    return (
      <div className="App">
        <div
          className={
            status === "Connected"
              ? "ui positive message"
              : "ui negative message"
          }
        >
          <Websocket
            url="wss://ws.blockchain.info/inv"
            onMessage={this.handleData.bind(this)}
            onOpen={this.handleOpen.bind(this)}
            onClose={this.handleClose.bind(this)}
            ref={Websocket => {
              this.refWebSocket = Websocket;
            }}
          />
          <Message.Header>{status}</Message.Header>
        </div>
        <Link to="/search">
          <button
            class="ui black basic button"
            style={{ margin: 10, float: "right" }}
          >
            Search Data
          </button>
        </Link>
        <div />

        {graphData.length == 0 && <Loader active inline="centered" />}
        {graphData.length != 0 && (
          <VictoryChart theme={VictoryTheme.material} domainPadding={20}>
            <VictoryAxis
              tickValues={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              tickFormat={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
            />
            <VictoryAxis
              dependentAxis
              label="Amount in BTC"
              style={{
                axis: { stroke: "#756f6a" },
                axisLabel: { fontSize: 15, padding: 30, color: "red" },
                grid: { stroke: t => (t > 0.5 ? "red" : "grey") },
                ticks: { stroke: "grey", size: 5 },
                tickLabels: { fontSize: 12, padding: 5 }
              }}
              tickFormat={x => `${x}`}
            />
            <VictoryLine
              style={{
                data: { stroke: "#c43a31" },
                parent: { border: "1px solid #ccc" },
                label: { fontSize: 4 }
              }}
              data={graphData}
              animate={{
                duration: 2000,
                onLoad: { duration: 1000 }
              }}
              labels={datum => datum.x}
              labelComponent={
                <VictoryLabel style={{ fontSize: 6 }} renderInPortal dy={-20} />
              }
              // data accessor for x values
              x="x"
              // data accessor for y values
              y="y"
            />
          </VictoryChart>
        )}
      </div>
    );
  }
}

export { ChartScreen };
