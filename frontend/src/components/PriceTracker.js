import { Table, Tabs } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

const API_URL = "https://api.binance.com/api/v3/ticker/24hr";

const symbols = ["USDT", "USDC", "ETH", "BTC", "TUSD", "EUR"];

const PriceTracker = () => {
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]);

  const [dataSource, setDataSource] = useState([]);

  useEffect(() => {
    fetchData();
    // const interval = setInterval(fetchData, 10000); // Update every 30 seconds
    // return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedSymbol]);

  const fetchData = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setDataSource(
        data
          .filter(
            ({ symbol, lastPrice }) =>
              symbol.slice(-selectedSymbol.length) === selectedSymbol &&
              +lastPrice
          )
          .map((item) => ({
            symbol: item.symbol,
            price: +item.lastPrice,
            change: +item.priceChangePercent,
          }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const columns = [
    {
      key: "pair",
      dataIndex: "symbol",
      title: "Pair",
      render: (_, item) => (
        <div>
          <span style={{ color: "white" }}>
            {item.symbol.slice(0, -selectedSymbol.length)}
          </span>
          <span>/{item.symbol.slice(-selectedSymbol.length)}</span>
        </div>
      ),
    },
    {
      key: "price",
      dataIndex: "price",
      title: "Price",
      sorter: (a, b) => a.price - b.price,
    },
    {
      key: "change",
      dataIndex: "change",
      title: "Change",
      render: (_, item) => (
        <span style={{ color: item.change >= 0 ? "#0ECB81" : "#F6465D" }}>
          {item.change}%
        </span>
      ),
      sorter: (a, b) => a.change - b.change,
    },
  ];

  return (
    <div>
      <Tabs
        defaultActiveKey="tether"
        items={symbols.map((symbol) => ({ key: symbol, label: symbol }))}
        onChange={setSelectedSymbol}
      ></Tabs>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        className="price-table"
        scroll={{ y: 600 }}
      />
    </div>
  );
};

export default PriceTracker;
