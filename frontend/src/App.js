import "./App.css";
import ParamsView from "./components/ParamsView";

import { ConfigProvider, theme, Layout } from "antd";
import PriceTracker from "./components/PriceTracker";
import OrderList from "./components/OrderList";
const { Content, Sider } = Layout;

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        components: { Layout: { bodyBg: "#16171a" } },
      }}
    >
      <Layout className="root-container">
        <Content>
          <ParamsView />
          <OrderList />
        </Content>
        <Sider
          width={380}
          style={{ background: "none", padding: "0 20px 20px" }}
        >
          <PriceTracker />
        </Sider>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
