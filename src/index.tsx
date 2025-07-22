import './index.css';
import { render } from "react-dom";
import { App } from "./App";
import { ThemeProvider } from './context/themeContext';
render(<ThemeProvider><App /></ThemeProvider>, document.getElementById("root"));