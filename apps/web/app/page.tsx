const decisions = ["BUY", "WATCH", "HOLD", "REDUCE", "EXIT"] as const;

export default function Home() {
  return (
    <main style={{ padding: 32, fontFamily: "sans-serif", maxWidth: 960, margin: "0 auto" }}>
      <h1>Broker Partner OS</h1>
      <p>Decision operating system for disciplined capital allocation.</p>

      <section>
        <h2>Decision Desk</h2>
        <ul>{decisions.map((item) => <li key={item}>{item}</li>)}</ul>
        <p><strong>SPECULATIVE SHORT</strong> — manual approval required.</p>
      </section>

      <section>
        <h2>MVP status</h2>
        <p>Foundation initialized. Portfolio, research, risk and signal intelligence are next.</p>
      </section>
    </main>
  );
}
