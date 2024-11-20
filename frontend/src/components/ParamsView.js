import {
  Input,
  InputNumber,
  Layout,
  Tabs,
  Form,
  Button,
  Space,
  Select,
  Flex,
  Modal,
  List,
  Spin,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  apiCreateSymbol,
  apiDeleteSymbol,
  apiGetParams,
  apiGetSymbols,
  apiSetParams,
  apiUpdateSymbol,
} from "../api";

const initialParams = {
  symbol: "",
  volume: "",
  expectedBuy: 0,
  stopLoss: 0,
  takeProfit: 0,
  active: false,
};

const styles = {
  input: { marginTop: 8 },
  inputNumber: { width: "100%", marginTop: 8, padding: "2px 10px" },
  inputPrefix: {
    display: "flex",
    alignItems: "center",
    height: 26,
    color: "#6e7583",
  },
  inputNumberPrefix: { color: "#6e7583" },
  buttonsGroup: {
    display: "flex",
    justifyContent: "center",
    marginTop: 16,
  },
};

const emptySymbol = { id: -1, name: "" };
const ParamsView = () => {
  const [tradeParams, setTradeParams] = useState(initialParams);
  const [symbols, setSymbols] = useState([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [symbolToEdit, setSymbolToEdit] = useState(emptySymbol);
  const [errorMessage, setErrorMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState();

  useEffect(() => {
    getParams();
    getSymbols();
  }, []);

  const getParams = async () => {
    try {
      const { data } = await apiGetParams();
      setTradeParams(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getSymbols = async () => {
    try {
      setLoading(true);
      const { data } = await apiGetSymbols();
      setSymbols(data.symbols);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const { symbol, volume, expectedBuy, stopLoss, takeProfit, active } =
    tradeParams;

  const handleStartStop = async () => {
    try {
      const { active, ...restParams } = tradeParams;
      if (
        !(
          (!expectedBuy && !stopLoss && !takeProfit) ||
          (expectedBuy && stopLoss && takeProfit)
        )
      ) {
        alert("Wrong parameters");
        return;
      }

      const { data } = await apiSetParams(restParams);
      setTradeParams({ ...tradeParams, active: data.status });
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddEditSymbol = async () => {
    try {
      if (!symbolToEdit.name.trim().length) {
        setErrorMessage("It should not be empty!");
        return;
      }
      if (symbols.find(({ name }) => symbolToEdit.name === name)) {
        setErrorMessage("The symbol already exists!");
        return;
      }

      setLoading(true);
      if (symbolToEdit.id !== -1) {
        await apiUpdateSymbol(symbolToEdit.id, symbolToEdit.name);
      } else {
        await apiCreateSymbol(symbolToEdit.name);
      }

      setSymbolToEdit(emptySymbol);
      await getSymbols();
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleDeleteSymbol = async (id) => {
    setLoading(true);
    await apiDeleteSymbol(id);
    await getSymbols();
  };
  return (
    <Layout className="mt-5">
      <Modal
        title="Symbol Manager"
        open={modalOpened}
        onCancel={() => {
          setModalOpened(false);
          setErrorMessage();
          setSymbolToEdit(emptySymbol);
        }}
        footer={null}
      >
        <Spin spinning={loading}>
          <Flex style={{ marginTop: 12 }}>
            <Input
              placeholder="Enter symbol"
              value={symbolToEdit.name}
              onChange={(e) => {
                setSymbolToEdit({ ...symbolToEdit, name: e.target.value });
                setErrorMessage();
              }}
              style={{ marginRight: 8 }}
            />
            <Button type="primary" onClick={() => handleAddEditSymbol()}>
              {symbolToEdit.id !== -1 ? "Update" : "Add"}
            </Button>
          </Flex>
          {errorMessage && (
            <span style={{ color: "#dc4446", fontSize: 12 }}>
              {errorMessage}
            </span>
          )}
          <List
            style={{ marginTop: 12 }}
            bordered
            dataSource={symbols}
            renderItem={(symbol) => (
              <List.Item
                style={{ padding: "4px 12px" }}
                actions={[
                  <Button
                    type="link"
                    onClick={() => setSymbolToEdit(symbol)}
                    style={{ padding: 0 }}
                  >
                    Edit
                  </Button>,
                  <Button
                    type="link"
                    danger
                    onClick={() => handleDeleteSymbol(symbol.id)}
                    style={{ padding: 0 }}
                  >
                    Delete
                  </Button>,
                ]}
              >
                <span>{symbol.name}</span>
              </List.Item>
            )}
          />
        </Spin>
      </Modal>
      <Tabs
        defaultActiveKey="trade"
        items={[
          {
            key: "trade",
            label: "General",
            children: (
              <Form style={{ marginTop: -8 }}>
                <Flex>
                  <Select
                    style={{ flex: 1, marginRight: 8 }}
                    options={symbols.map(({ id, name }) => ({
                      value: id,
                      label: name,
                    }))}
                    placeholder="Select a symbol"
                    onChange={(_, value) =>
                      setTradeParams({ ...tradeParams, symbol: value.label })
                    }
                    value={symbol}
                  />
                  <Button onClick={() => setModalOpened(true)}>
                    Add / Edit
                  </Button>
                </Flex>
                {/* <Input
                  prefix={<span style={styles.inputPrefix}>Symbol:</span>}
                  value={symbol}
                  onChange={(e) =>
                    setTradeParams({ ...tradeParams, symbol: e.target.value })
                  }
                  style={styles.input}
                /> */}
                <Input
                  prefix={<span style={styles.inputPrefix}>Trade Volume:</span>}
                  value={volume}
                  onChange={(e) =>
                    setTradeParams({ ...tradeParams, volume: e.target.value })
                  }
                  style={styles.input}
                />
              </Form>
            ),
          },
          {
            key: "parameters",
            label: "Trade Parameters",
            children: (
              <Form style={{ marginTop: -8 }}>
                <InputNumber
                  prefix={
                    <span style={styles.inputNumberPrefix}>
                      Expected Buy Price:
                    </span>
                  }
                  value={expectedBuy}
                  onChange={(value) =>
                    setTradeParams({ ...tradeParams, expectedBuy: value })
                  }
                  style={styles.inputNumber}
                />
                <InputNumber
                  prefix={
                    <span style={styles.inputNumberPrefix}>
                      Take Profit (%):
                    </span>
                  }
                  value={takeProfit}
                  onChange={(value) =>
                    setTradeParams({ ...tradeParams, takeProfit: value })
                  }
                  style={styles.inputNumber}
                />
                <InputNumber
                  prefix={
                    <span style={styles.inputNumberPrefix}>Stop Loss (%):</span>
                  }
                  value={stopLoss}
                  onChange={(value) =>
                    setTradeParams({ ...tradeParams, stopLoss: value })
                  }
                  style={styles.inputNumber}
                />
              </Form>
            ),
          },
        ]}
      ></Tabs>
      <Space style={styles.buttonsGroup}>
        <Button type="primary" onClick={handleStartStop}>
          {active ? "Stop" : "Start"}
        </Button>
        <Button onClick={() => setTradeParams(initialParams)}>Clear</Button>
      </Space>
    </Layout>
  );
};

export default ParamsView;
