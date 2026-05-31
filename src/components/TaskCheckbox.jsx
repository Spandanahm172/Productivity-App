import './TaskCheckbox.css';

export function TaskCheckbox({ checked, onChange, label, coinReward = 10 }) {
  return (
    <label className={`taskItem ${checked ? 'checked' : ''}`}>
      <div className="checkboxWrapper">
        <input 
           type="checkbox" 
           checked={checked} 
           onChange={onChange} 
           className="hiddenCheckbox"
        />
        <div className="styledBox">
           {checked && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
        </div>
      </div>
      <div className="taskLabel">
         <span className="taskText">{label}</span>
         {!checked && <span className="taskReward">+{coinReward} 🪙</span>}
      </div>
    </label>
  );
}
