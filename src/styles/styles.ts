export const containerStyle = {
  display: "flex",
  alignItems: "center",
  flexDirection: "column" as const,
};

export const instructionsStyle = {
  marginTop: "5px",
  marginBottom: "5px",
  fontWeight: "bold" as const,
  fontSize: "16px",
};

export const winnerStyle = {
  ...instructionsStyle,
  minWidth: "120px",
  textAlign: "left" as const,
};
export const nextPlayerStyle = {
  ...instructionsStyle,
  minWidth: "120px",
  textAlign: "right" as const,
};

export const buttonStyle = {
  marginTop: "15px",
  marginBottom: "16px",
  width: "80px",
  height: "40px",
  backgroundColor: "#8acaca",
  color: "white",
  fontSize: "16px",
};

export const buttonGroupStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "6px",
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
