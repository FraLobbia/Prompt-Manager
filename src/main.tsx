import { createRoot } from "react-dom/client"
import "./index.scss"
import { Provider } from "react-redux"
import { store } from "./store/store"
import { App } from "./App"
import "./testClipboard" // Test per la persistenza clipboard

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
)
