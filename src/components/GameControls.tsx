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
      <button style={buttonStyle} onClick={onHost} disabled={isLoading}>
        Host
      </button>
      <button style={buttonStyle} onClick={onJoin} disabled={isLoading}>
        Join
      </button>
      <button style={buttonStyle} onClick={onIncrease} disabled={isLoading}>
        +
      </button>
      <button style={buttonStyle} onClick={onDecrease} disabled={isLoading}>
        -
      </button>
      <button style={buttonStyle} onClick={onReset} disabled={isLoading}>
        Reset
      </button>
    </div>
  );
}
