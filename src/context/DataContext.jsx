import { createContext, useContext, useReducer } from "react";
import {
  DEFAULT_EXP_DATA,
  DEFAULT_HERO_ALERTS,
  DEFAULT_LOWER_ALARMS,
  DEFAULT_COVERAGE_BARS,
  DEFAULT_BLACK_MARKET,
  DEFAULT_FQDN_DATA,
  DEFAULT_THIRD_PARTY_DATA,
  DEFAULT_EXPOSED_EMP,
  DEFAULT_STATS,
} from "../data/defaults";

const initialState = {
  threatLevel: "critical",
  heroAlerts: DEFAULT_HERO_ALERTS,
  lowerAlarms: DEFAULT_LOWER_ALARMS,
  coverageBars: DEFAULT_COVERAGE_BARS,
  blackMarket: DEFAULT_BLACK_MARKET,
  fqdnData: DEFAULT_FQDN_DATA,
  thirdPartyData: DEFAULT_THIRD_PARTY_DATA,
  exposedEmp: DEFAULT_EXPOSED_EMP,
  expData: DEFAULT_EXP_DATA,
  stats: DEFAULT_STATS,
  adminOpen: false,
};

function dataReducer(state, action) {
  switch (action.type) {
    case "SET_THREAT_LEVEL":
      return { ...state, threatLevel: action.payload };
    case "SET_HERO_ALERTS":
      return { ...state, heroAlerts: action.payload };
    case "DISMISS_HERO_ALERT":
      return { ...state, heroAlerts: state.heroAlerts.filter((a) => a.id !== action.payload) };
    case "SET_LOWER_ALARMS":
      return { ...state, lowerAlarms: action.payload };
    case "SET_COVERAGE_BARS":
      return { ...state, coverageBars: action.payload };
    case "SET_BLACK_MARKET":
      return { ...state, blackMarket: action.payload };
    case "SET_FQDN_DATA":
      return { ...state, fqdnData: action.payload };
    case "SET_THIRD_PARTY_DATA":
      return { ...state, thirdPartyData: action.payload };
    case "SET_EXPOSED_EMP":
      return { ...state, exposedEmp: action.payload };
    case "SET_EXP_DATA":
      return { ...state, expData: action.payload };
    case "SET_STATS":
      return { ...state, stats: action.payload };
    case "TOGGLE_ADMIN":
      return { ...state, adminOpen: !state.adminOpen };
    case "RESET_ALL":
      return { ...initialState, adminOpen: state.adminOpen };
    default:
      return state;
  }
}

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
