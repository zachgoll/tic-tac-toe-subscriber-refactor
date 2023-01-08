import "./Modal.css";

type Props = {
  text: string;
  onClick(): void;
};

export default function Modal({ text, onClick }: Props) {
  return (
    <div className="modal">
      <div className="modal-contents">
        <p>{text}</p>
        <button onClick={onClick}>Play again</button>
      </div>
    </div>
  );
}
