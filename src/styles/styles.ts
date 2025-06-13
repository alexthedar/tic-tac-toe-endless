export const containerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexDirection: "column" as const,
};

export const instructionsStyle: React.CSSProperties = {
  marginTop: "5px",
  marginBottom: "5px",
  fontWeight: "bold" as const,
  fontSize: "16px",
};

export const winnerStyle: React.CSSProperties = {
  ...instructionsStyle,
  minWidth: "120px",
  textAlign: "left" as const,
};
export const nextPlayerStyle: React.CSSProperties = {
  ...instructionsStyle,
  minWidth: "120px",
  textAlign: "right" as const,
};

export const buttonStyle: React.CSSProperties = {
  marginTop: "15px",
  marginBottom: "16px",
  width: "80px",
  height: "40px",
  backgroundColor: "#8acaca",
  color: "white",
  fontSize: "16px",
};

export const buttonGroupStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "6px",
};

export const overlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.2)",
  zIndex: 10,
};

export function getCalculatedStyles({
  boardSize,
  isLoading,
}: {
  boardSize: number;
  isLoading: boolean;
}) {
  const boardWidth = boardSize * 2 + 50;
  const squareVW = boardWidth / boardSize;

  const boardStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
    gap: `${Math.min(1, 3 / boardSize)}vw`,
    width: `${boardWidth}vw`,
  };
  const squareStyle = {
    aspectRatio: "1",
    backgroundColor: "#ddd",
    fontSize: `${squareVW * 0.5}vw`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    transition: "opacity 0.2s ease",
    opacity: isLoading ? 0.4 : 1,
    cursor: isLoading ? "not-allowed" : "pointer",
    pointerEvents: isLoading
      ? "none"
      : ("auto" as React.CSSProperties["pointerEvents"]),
  };
  const controlsWrapperStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    width: `${boardWidth}vw`,
  };
  return {
    boardStyle,
    squareStyle,
    controlsWrapperStyle,
  };
}
