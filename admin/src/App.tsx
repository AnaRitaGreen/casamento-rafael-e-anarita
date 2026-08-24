import { Provider } from "@/components/ui/provider"
import { Router } from "./routes";

export function App() {
  return (
    <Provider>
      <Router />
    </Provider>
  );
}
