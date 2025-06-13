export function GameOverlay() {
  return (
    <div
      style={{
        position: "absolute" as const,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        zIndex: 10,
      }}
    />
  );
}
