import React, { useState } from "react";
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity, StyleSheet } from "react-native";

const rows = [
  ["AC", "+/-", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["⌫", "0", ".", "="],
];

function calculate(input) {
  const tokens = input.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").match(/\d*\.?\d+|[+\-*/]/g);
  if (!tokens || tokens.join("") !== input.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s/g, "")) throw new Error("Invalid");
  let index = 0;
  function factor() {
    if (tokens[index] === "-") { index++; return -factor(); }
    if (tokens[index] === "+") { index++; return factor(); }
    const n = Number(tokens[index++]);
    if (!Number.isFinite(n)) throw new Error("Invalid");
    return n;
  }
  function term() {
    let n = factor();
    while (tokens[index] === "*" || tokens[index] === "/") {
      const op = tokens[index++];
      const rhs = factor();
      if (op === "/" && rhs === 0) throw new Error("Division by zero");
      n = op === "*" ? n * rhs : n / rhs;
    }
    return n;
  }
  function expression() {
    let n = term();
    while (tokens[index] === "+" || tokens[index] === "-") {
      const op = tokens[index++];
      const rhs = term();
      n = op === "+" ? n + rhs : n - rhs;
    }
    return n;
  }
  const result = expression();
  if (index !== tokens.length || !Number.isFinite(result)) throw new Error("Invalid");
  return result;
}

export default function App() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [finished, setFinished] = useState(false);

  function press(key) {
    if (key === "AC") { setDisplay("0"); setExpression(""); setFinished(false); return; }
    if (key === "⌫") { setDisplay(v => v.length > 1 ? v.slice(0, -1) : "0"); setFinished(false); return; }
    if (key === "+/-") { setDisplay(v => v === "0" ? "0" : v.startsWith("-") ? v.slice(1) : "-" + v); return; }
    if (key === "%") { const n = Number(display); if (Number.isFinite(n)) setDisplay(String(n / 100)); return; }
    if (key === "=") {
      try {
        const result = calculate(expression + display);
        const formatted = Number(result.toPrecision(12)).toString();
        setExpression(expression + display + " =");
        setDisplay(formatted);
        setFinished(true);
      } catch { setExpression("Error"); setDisplay("0"); setFinished(true); }
      return;
    }
    if (["+", "−", "×", "÷"].includes(key)) {
      const current = finished ? display : expression + display;
      setExpression(current + key);
      setDisplay("0");
      setFinished(false);
      return;
    }
    if (key === ".") { if (!display.includes(".")) setDisplay(v => finished ? "0." : v + "."); setFinished(false); return; }
    if (/^\d$/.test(key)) { setDisplay(v => finished || v === "0" ? key : v + key); setFinished(false); if (finished) setExpression(""); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0d12" />
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.brand}>CALCULATOR</Text>
          <View style={styles.dot} />
        </View>
        <View style={styles.displayArea}>
          <Text style={styles.expression} numberOfLines={1}>{expression}</Text>
          <Text style={styles.display} numberOfLines={1} adjustsFontSizeToFit>{display}</Text>
        </View>
        <View style={styles.keypad}>
          {rows.map((row, ri) => (
            <View style={styles.row} key={ri}>
              {row.map((key) => {
                const operator = ["÷", "×", "−", "+", "="].includes(key);
                const utility = ["AC", "+/-", "%", "⌫"].includes(key);
                const equals = key === "=";
                return (
                  <TouchableOpacity key={key} activeOpacity={0.75} onPress={() => press(key)}
                    style={[styles.key, operator && styles.operator, utility && styles.utility, equals && styles.equals, key === "0" && styles.zero]}>
                    <Text style={[styles.keyText, operator && styles.operatorText, utility && styles.utilityText, equals && styles.equalsText]}>{key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
        <Text style={styles.footer}>Simple · Fast · Offline</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b0d12" },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { color: "#7e8797", fontSize: 12, letterSpacing: 3, fontWeight: "700" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#a5f36b" },
  displayArea: { flex: 1, justifyContent: "flex-end", alignItems: "flex-end", paddingBottom: 28 },
  expression: { color: "#737b8b", fontSize: 22, marginBottom: 12, minHeight: 28 },
  display: { color: "#f4f6fb", fontSize: 58, fontWeight: "300", letterSpacing: -1 },
  keypad: { gap: 12 },
  row: { flexDirection: "row", gap: 12 },
  key: { flex: 1, height: 68, borderRadius: 22, backgroundColor: "#1a1e27", justifyContent: "center", alignItems: "center" },
  zero: { flex: 1 },
  keyText: { color: "#f1f3f8", fontSize: 24, fontWeight: "500" },
  utility: { backgroundColor: "#272c36" },
  utilityText: { color: "#c3cad6", fontSize: 19 },
  operator: { backgroundColor: "#222b22", borderWidth: 1, borderColor: "#334431" },
  operatorText: { color: "#a5f36b", fontSize: 26 },
  equals: { backgroundColor: "#a5f36b", borderColor: "#a5f36b" },
  equalsText: { color: "#10150d", fontWeight: "700" },
  footer: { textAlign: "center", color: "#4c5360", fontSize: 11, letterSpacing: 1.5, marginTop: 18 },
});
