import React from "react";
import { Link } from "react-router-dom";
import "../App/App.css";
import { Dropdown, List, Input, Icon } from "semantic-ui-react";

class SearchScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currencyType: "btc",
      searchQuery: "",
      globalData: [],
      filteredData: []
    };

    this.onGetSearchQuery = this.onGetSearchQuery.bind(this);
    this.getType = this.getType.bind(this);
  }

  componentWillMount() {
    //get Global data list from local storage
    this.state.globalData = JSON.parse(localStorage.getItem("globalData"));
  }

  getType(event, { value }) {
    this.state.currencyType = value;
  }

  onGetSearchQuery(event) {
    //Search data
    this.setState({
      searchQuery: event.target.value
    });
    this.state.filteredData = this.state.globalData.filter(item => {
      if (this.state.currencyType === "btc") {
        return item.amountBTC.toString().indexOf(event.target.value) > -1;
      } else {
        return item.amountUSD.toString().indexOf(event.target.value) > -1;
      }
    });

    let tempFilteredData = this.state.filteredData;
    tempFilteredData.splice((0, 3));
  }

  renderListData() {
    if (this.state.filteredData) {
      return this.state.filteredData.map((item, index) => {
        const { amountBTC, amountUSD, transactionHash } = item; //destructuring
        return (
          <List.Content style={{ margin: 20 }}>
            <List.Header style={{ color: "#34495E" }}>
              Hash: {transactionHash}
            </List.Header>
            <List.Description>BTC: {amountBTC}</List.Description>
            <List.Description>USD: {amountUSD}</List.Description>
          </List.Content>
        );
      });
    }
  }

  render() {
    const options = [
      {
        key: "btc",
        text: "BTC",
        value: "btc"
      },
      {
        key: "usd",
        text: "USD",
        value: "usd"
      }
    ];
    return (
      <div className="App">
        <div class="ui menu asd borderless">
          <Link
            to="/chart"
            style={{ height: "100%", alignSelf: "center", margin: 6 }}
          >
            <i class="icon chart line big" />
          </Link>
          <input
            class="search"
            onChange={this.onGetSearchQuery}
            placeholder="Search for transactions by BTC or USD"
          />
          <Icon className="searchIcon" name="search" />
          <div class="right menu">
            <Dropdown
              style={{ padding: 12, margin: 10 }}
              placeholder="Select Currency Type"
              inline
              options={options}
              onChange={this.getType}
              defaultValue={this.state.currencyType}
            />
          </div>
        </div>
        <div>
          {this.state.filteredData && (
            <List divided relaxed>
              <List.Item>{this.renderListData()}</List.Item>
            </List>
          )}
        </div>
      </div>
    );
  }
}

export { SearchScreen };
