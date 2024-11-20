import { Table, Tabs } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";

const API_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd";

const symbols = [
  { id: "tether", title: "USDT" },
  { id: "usd-coin", title: "USDC" },
  { id: "ethereum", title: "ETH" },
  { id: "bitcoin", title: "BTC" },
  { id: "true-usd", title: "TUSD" },
  { id: "eur", title: "EUR" },
];
const PriceTracker = () => {
  const [currency, setCurrency] = useState("usd");
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
      const res = await axios.get(API_URL, {
        params: { vs_currency: "usd", ids: selectedSymbol.id },
      });
      const usdPrice = res.data[0].current_price;
      const { data } = await axios.get(API_URL, {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 10,
          page: 1,
          sparkline: false,
        },
      });

      setDataSource(
        data
          .filter((item) => item.id !== selectedSymbol.id)
          .map((item) => ({
            symbol: item.symbol,
            name: item.name,
            price: (item.current_price / usdPrice).toFixed(2),
            change: item.price_change_percentage_24h,
            // change: (
            //   (item.price_change_percentage_24h * item.current_price) /
            //   usdPrice
            // ).toFixed(5),
            usdPrice: item.current_price,
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
          <div>
            <span style={{ color: "white" }}>{item.symbol.toUpperCase()}</span>
            <span>/{currency.toUpperCase()}</span>
          </div>
          <div>{item.name}</div>
        </div>
      ),
    },
    {
      key: "price",
      dataIndex: "price",
      title: "Price",
      render: (_, item) => (
        <div>
          <div style={{ color: "white" }}>{item.price}</div>
          <div>{item.usdPrice}</div>
        </div>
      ),
    },
    { key: "change", dataIndex: "change", title: "Change" },
  ];

  return (
    <div>
      <Tabs
        defaultActiveKey="tether"
        items={symbols.map(({ id, title }) => ({ key: id, label: title }))}
        onChange={(value) =>
          setSelectedSymbol(symbols.find(({ id }) => id === value))
        }
      ></Tabs>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        className="price-table"
      />
    </div>
  );
};

export default PriceTracker;
