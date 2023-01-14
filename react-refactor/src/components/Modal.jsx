import "./Modal.css";

export default function Modal({ text, onClick }) {
  return (
    <div className="modal">
      <div className="modal-contents">
        <p>{text}</p>
        <button onClick={onClick}>Play again</button>
      </div>
    </div>
  );
}
