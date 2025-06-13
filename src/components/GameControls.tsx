import { buttonGroupStyle, buttonStyle } from "../styles/styles";

interface GameControlsProps {
  onHost: () => void;
  onJoin: () => void;
  onReset: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  isLoading: boolean;
}

export function GameControls({
  onHost,
  onJoin,
  onReset,
  onIncrease,
  onDecrease,
  isLoading,
}: GameControlsProps) {
  return (
    <div style={buttonGroupStyle}>
      <button onClick={onIncrease} disabled={isLoading} style={buttonStyle}>
        +
      </button>
      <button onClick={onHost} disabled={isLoading} style={buttonStyle}>
        Host
      </button>
      <button onClick={onJoin} disabled={isLoading} style={buttonStyle}>
        Join
      </button>
      <button onClick={onReset} disabled={isLoading} style={buttonStyle}>
        Reset
      </button>
      <button onClick={onDecrease} disabled={isLoading} style={buttonStyle}>
        -
      </button>
    </div>
  );
}
